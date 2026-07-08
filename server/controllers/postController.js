const Post = require('../models/Post');
const mongoose = require('mongoose');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { content, mediaUrl, teamTag } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Post content cannot be empty." });
        }

        // 🔑 Extract safely from authMiddleware's token decryption signature!
        const verifiedAuthorId = req.user?.id || req.user?._id;
        
        if (!verifiedAuthorId) {
            return res.status(401).json({ message: "Unauthorized - Valid player session required" });
        }

        const newPost = new Post({ 
            author: new mongoose.Types.ObjectId(verifiedAuthorId), 
            content: content.trim(), 
            mediaUrl: mediaUrl || '', 
            teamTag: teamTag || 'General' 
        });
        
        await newPost.save();
        
        // Populate author parameters before returning
        await newPost.populate('author', '_id username');
        
        res.status(201).json({ 
            message: "Post created successfully", 
            post: {
                _id: newPost._id,
                content: newPost.content,
                author: {
                    _id: newPost.author?._id || verifiedAuthorId,
                    username: newPost.author?.username || 'Anonymous'
                },
                likes: newPost.likes || [],
                teamTag: newPost.teamTag,
                mediaUrl: newPost.mediaUrl,
                createdAt: newPost.createdAt
            }
        });
    } catch (error) {
        console.error("❌ Post Creation Error:", error.message || error);
        res.status(500).json({ message: "Error creating post", error: error.message || error });
    }
};

// Get all posts (player names linked to their posts)
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', '_id username')
            .sort({ createdAt: -1 });
        
        // Defensive mapping protection against legacy missing fields
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            content: post.content,
            author: {
                _id: post.author?._id || 'deleted_user',
                username: post.author?.username || 'Unknown Player'
            },
            likes: post.likes || [],
            comments: post.comments || [], // 👈 Add this line to pass down saved discussions!
            teamTag: post.teamTag || 'League Feed',
            mediaUrl: post.mediaUrl || '',
            createdAt: post.createdAt
        }));
        
        res.json({ 
            message: "Posts retrieved successfully",
            count: formattedPosts.length,
            posts: formattedPosts 
        });
    } catch (error) {
        console.error("❌ Post Retrieval Error:", error.message || error);
        res.status(500).json({ message: "Error fetching posts", error: error.message || error });
    }
};

// Like and unlike post
exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id || req.user?._id; // Extracted safely from token context

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Authentication required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        const likeStrings = post.likes.map(like => like.toString());
        const alreadyLiked = likeStrings.includes(userId);
        
        if (!alreadyLiked) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter(like => like.toString() !== userId);
        }
        
        await post.save();
        res.json({ message: "Post like status updated", post });
    } catch (error) {
        res.status(500).json({ message: "Error updating like status", error: error.message });
    }
};

// Search posts by content and/or team
exports.searchPosts = async (req, res) => {
    try {
        console.log("🔍 Advanced Search Triggered with Params:", req.query);

        // 1. Extract Keyword Content
        const keyword = req.query.query || req.query.content || req.query.keyword || '';
        
        // 2. Extract Team Parameter
        const teamParam = req.query.teamTag || req.query.team || req.query.favouriteTeam || '';
        
        // 3. Extract Author Username
        const authorParam = req.query.authorName || req.query.author || req.query.username || '';

        let filter = {};

        // 📝 Filter A: Keyword Content Search
        if (keyword && keyword.trim() !== '') {
            filter.content = { $regex: keyword.trim(), $options: 'i' };
        }

        // 🏀 Filter B: Fuzzy Team Tag Matching (Fixes "Lakers Locker Room" vs "Los Angeles Lakers")
        if (teamParam && teamParam.trim() !== '' && teamParam !== 'All Teams') {
            let cleanTeam = teamParam.trim();
            
            // If the frontend sends a full room wrapper name like "Lakers Locker Room",
            // clean it up to just use the core city or name identifier words
            if (cleanTeam.toLowerCase().includes('locker room')) {
                cleanTeam = cleanTeam.replace(/locker room/i, '').trim();
            } else if (cleanTeam.toLowerCase().includes('playbook')) {
                cleanTeam = cleanTeam.replace(/playbook/i, '').trim();
            } else if (cleanTeam.toLowerCase().includes('strength room')) {
                cleanTeam = cleanTeam.replace(/strength room/i, '').trim();
            }

            // Use a case-insensitive regex pattern so "Lakers" matches "Los Angeles Lakers"
            filter.teamTag = { $regex: cleanTeam, $options: 'i' };
        }

        // 👤 Filter C: Author Username Lookup
        if (authorParam && authorParam.trim() !== '') {
            const User = mongoose.model('User');
            
            // Find any user matching that typed username string
            const matchingUsers = await User.find({
                username: { $regex: authorParam.trim(), $options: 'i' }
            });
            
            if (matchingUsers && matchingUsers.length > 0) {
                const userIds = matchingUsers.map(u => u._id);
                filter.author = { $in: userIds };
            } else {
                // Return empty array immediately if author username doesn't exist
                return res.status(200).json({ message: "No matching players found.", count: 0, results: [] });
            }
        }

        // Execute search query against MongoDB
        const results = await Post.find(filter)
            .populate('author', '_id username')
            .sort({ createdAt: -1 });
        
        // Format payload cleanly for frontend mapping rules
        const formattedResults = results.map(post => ({
            _id: post._id,
            content: post.content,
            author: {
                _id: post.author?._id || 'deleted_user',
                username: post.author?.username || 'Unknown Player'
            },
            likes: post.likes || [],
            comments: post.comments || [],
            teamTag: post.teamTag || 'General',
            mediaUrl: post.mediaUrl || '',
            createdAt: post.createdAt
        }));
        
        console.log(`✅ Search complete. Returned ${formattedResults.length} posts matching query.`);
        res.status(200).json({ 
            message: "Search completed", 
            count: formattedResults.length,
            results: formattedResults 
        });

    } catch (error) {
        console.error("❌ Advanced Search System Error:", error.message);
        res.status(500).json({ message: "Search execution failed", error: error.message });
    }
};

// Delete a post (only author or admin can delete)
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user?.id || req.user?._id;
        const userRole = req.user?.isAdmin ? 'admin' : '';

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const isAuthor = post.author && post.author.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You can only delete your own posts" });
        }

        await Post.findByIdAndDelete(postId);
        res.json({ message: "Post deleted from The League" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error: error.message });
    }
};

// Update a post (only author or admin can update)
exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        const userId = req.user?.id || req.user?._id;
        const userRole = req.user?.isAdmin ? 'admin' : '';
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const isAuthor = post.author && post.author.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You can only edit your own posts" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId, 
            { content: content.trim() }, 
            { new: true }
        ).populate('author', '_id username');

        res.json({ 
            message: "Post updated successfully", 
            post: {
                _id: updatedPost._id,
                content: updatedPost.content,
                author: {
                    _id: updatedPost.author?._id || userId,
                    username: updatedPost.author?.username || 'Unknown Player'
                },
                likes: updatedPost.likes || [],
                teamTag: updatedPost.teamTag,
                mediaUrl: updatedPost.mediaUrl,
                createdAt: updatedPost.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error: error.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const { text } = req.body;
        const userId = req.user?.id || req.user?._id;
        const username = req.user?.username;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment content cannot be empty." });
        }

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Valid session required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Push new comment object straight into our schema array layout
        const newComment = {
            author: new mongoose.Types.ObjectId(userId),
            username: username || 'Anonymous Player',
            text: text.trim(),
            createdAt: new Date(),
            updatedAt: null
        };

        post.comments.push(newComment);
        await post.save();

        res.status(201).json({ 
            message: "Comment added successfully", 
            comments: post.comments 
        });
    } catch (error) {
        console.error("❌ Comment Creation Error:", error.message);
        res.status(500).json({ message: "Error adding comment", error: error.message });
    }
};

// Update a comment on a post
exports.updateComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.user?.id || req.user?._id;
        const isAdmin = req.user?.isAdmin || false;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Comment content cannot be empty.' });
        }

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized - Valid session required.' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        if (comment.author.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized - You can only edit your own comments.' });
        }

        comment.text = text.trim();
        comment.updatedAt = new Date();
        await post.save();

        res.status(200).json({
            message: 'Comment updated successfully',
            comments: post.comments
        });
    } catch (error) {
        console.error('❌ Comment Update Error:', error.message);
        res.status(500).json({ message: 'Error updating comment', error: error.message });
    }
};

// Delete a comment from a post
exports.deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user?.id || req.user?._id;
        const isAdmin = req.user?.isAdmin || false;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - Valid session required." });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        // Locate the target comment in the subdocument array
        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Security check: must be comment owner or admin
        if (comment.author.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You can only delete your own comments." });
        }

        // Pull the subdocument out of the array
        post.comments.pull(commentId);
        await post.save();

        res.json({ 
            message: "Comment deleted successfully", 
            comments: post.comments 
        });
    } catch (error) {
        console.error("❌ Comment Deletion Error:", error.message);
        res.status(500).json({ message: "Error deleting comment", error: error.message });
    }
};