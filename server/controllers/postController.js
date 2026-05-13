const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { author, content, mediaUrl, teamTag } = req.body;
        const newPost = new Post({ author, content, mediaUrl, teamTag });
        await newPost.save();
        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error });
    }
};

// Get all posts ( player names linked to their posts )
exports.getAllPosts = async (req, res) => {
    try {
        //.populate() is crucial for fetching the related user data (like username and team) along with the post details. It replaces the author field (which is an ObjectId) with the actual user document containing the specified fields.
        const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching posts", error });
    }
};

// Like and unlike post
exports.toggleLike = async (req, res) => {
    try {
        const { postId, userId } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex === -1) {
            post.likes.push(userId); // Like the post
        } else {
            post.likes.splice(likeIndex, 1); // Unlike the post
        }
        await post.save();
        res.json({ message: "Post like status updated", post });
    } catch (error) {
        res.status(500).json({ message: "Error updating like status", error });
    }
};

//search posts by content keyword
exports.searchPosts = async (req, res) => {
    try {
        const { query } = req.query; // React will call /api/posts/search?query=basketball
        const results = await Post.find({
            content: { $regex: query, $options: 'i' } // 'i' means case-insensitive
        }).populate('author', 'username');
        
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error });
    }
};

//Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const deletedPost = await Post.findByIdAndDelete(postId);
        
        if (!deletedPost) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post deleted from The League" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error });
    }
};

//Update a post
exports.updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        
        const updatedPost = await Post.findByIdAndUpdate(
            postId, 
            { content }, 
            { new: true } // Returns the modified document
        );

        if (!updatedPost) return res.status(404).json({ message: "Post not found" });
        res.json({ message: "Post updated successfully", post: updatedPost });
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error });
    }
};