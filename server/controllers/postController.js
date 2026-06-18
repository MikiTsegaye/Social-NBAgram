const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { author, content, mediaUrl, teamTag } = req.body;
        const newPost = new Post({ author, content, mediaUrl, teamTag });
        await newPost.save();
        
        // Populate author before returning
        await newPost.populate('author', '_id username');
        
        res.status(201).json({ 
            message: "Post created successfully", 
            post: {
                _id: newPost._id,
                content: newPost.content,
                author: {
                    _id: newPost.author._id,
                    username: newPost.author.username
                },
                likes: newPost.likes,
                teamTag: newPost.teamTag,
                mediaUrl: newPost.mediaUrl,
                createdAt: newPost.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error });
    }
};

// Get all posts ( player names linked to their posts )
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', '_id username')
            .sort({ createdAt: -1 });
        
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            content: post.content,
            author: {
                _id: post.author._id,
                username: post.author.username
            },
            likes: post.likes,
            teamTag: post.teamTag,
            mediaUrl: post.mediaUrl,
            createdAt: post.createdAt
        }));
        
        res.json({ 
            message: "Posts retrieved successfully",
            count: formattedPosts.length,
            posts: formattedPosts 
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
};

// Like and unlike post
exports.toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        // Convert all likes to strings for comparison
        const likeStrings = post.likes.map(like => like.toString());
        const alreadyLiked = likeStrings.includes(userId);
        
        if (!alreadyLiked) {
            post.likes.push(userId); // Like the post
        } else {
            post.likes = post.likes.filter(like => like.toString() !== userId); // Unlike the post
        }
        
        await post.save();
        res.json({ message: "Post like status updated", post });
    } catch (error) {
        res.status(500).json({ message: "Error updating like status", error });
    }
};

//Search posts by content and/or team
exports.searchPosts = async (req, res) => {
    try {
        const { query, teamTag } = req.query;
        let filter = {};

        // Build dynamic filter based on query parameters
        if (query) {
            filter.content = { $regex: query, $options: 'i' }; // Case-insensitive search
        }

        if (teamTag) {
            filter.teamTag = teamTag;
        }

        const results = await Post.find(filter)
            .populate('author', '_id username')
            .sort({ createdAt: -1 });
        
        const formattedResults = results.map(post => ({
            _id: post._id,
            content: post.content,
            author: {
                _id: post.author._id,
                username: post.author.username
            },
            likes: post.likes,
            teamTag: post.teamTag,
            mediaUrl: post.mediaUrl,
            createdAt: post.createdAt
        }));
        
        res.status(200).json({ 
            message: "Search completed", 
            count: formattedResults.length,
            results: formattedResults 
        });
    } catch (error) {
        res.status(500).json({ message: "Search failed", error });
    }
};

//Delete a post (only author or admin can delete)
exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId, userRole } = req.body; // Passed from client (or JWT middleware in future)

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check authorization: only author or admin can delete
        const isAuthor = post.author.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You can only delete your own posts" });
        }

        const deletedPost = await Post.findByIdAndDelete(postId);
        res.json({ message: "Post deleted from The League" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};

//Update a post (only author or admin can update)
exports.updatePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { content, userId, userRole } = req.body; // Passed from client (or JWT middleware in future)
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check authorization: only author or admin can update
        const isAuthor = post.author.toString() === userId;
        const isAdmin = userRole === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized - You can only edit your own posts" });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            postId, 
            { content }, 
            { new: true }
        ).populate('author', '_id username');

        res.json({ 
            message: "Post updated successfully", 
            post: {
                _id: updatedPost._id,
                content: updatedPost.content,
                author: {
                    _id: updatedPost.author._id,
                    username: updatedPost.author.username
                },
                likes: updatedPost.likes,
                teamTag: updatedPost.teamTag,
                mediaUrl: updatedPost.mediaUrl,
                createdAt: updatedPost.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error });
    }
};