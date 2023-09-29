const PostModel = require('../models/post.model');
const UserModel = require('../models/user.model');
const ObjectID = require('mongoose').Types.ObjectId;
const mime = require("mime-types");
const fs = require("fs").promises;

module.exports.readPost = async (req, res) => {
    try {
        const posts = await PostModel.find()
            .sort({ createdAt: -1 }) // Tri par ordre décroissant de l'horodatage
            .exec();

        res.status(200).json(posts);
    } catch (err) {
        console.error('Error to get data:', err);
        res.status(500).send('Internal server error');
    }
};

module.exports.createPost = async (req, res) => {
    try {
        if (!req.body.posterId) {
            return res.status(400).send("Missing posterId");
        }

        let fileName = "";

        if (req.file && req.file.buffer) {
            const fileMime = mime.lookup(req.file.originalname);

            if (!fileMime || !["image/jpeg", "image/png", "image/jpg"].includes(fileMime)) {
                return res.status(400).send("Type de fichier non pris en charge");
            }

            if (req.file.size > 4096000) {
                return res.status(400).send("La taille du fichier dépasse la limite de 4MB");
            }

            fileName = `${req.body.posterId}-${Date.now()}.jpg`;
            const filePath = `./client/public/uploads/posts/${fileName}`;

            await fs.writeFile(filePath, req.file.buffer);
        }

        const newPost = new PostModel({
            posterId: req.body.posterId,
            message: req.body.message || "",
            picture: fileName ? `./uploads/posts/${fileName}` : "",
            video: req.body.video,
            likers: [],
            comments: [],
        });

        const post = await newPost.save();
        return res.status(200).json(post);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

module.exports.updatePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    const updatedRecord = {
        message: req.body.message
    };

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            { $set: updatedRecord },
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        res.status(200).json(updatedPost);
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports.deletePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const deletedPost = await PostModel.findByIdAndDelete(req.params.id).exec();

        if (!deletedPost) {
            return res.status(404).send("Post not found");
        }

        res.status(200).json(deletedPost);
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports.likePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: { likers: req.body.id }
            },
            { new: true }
        ).exec();

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $addToSet: { likes: req.params.id }
            },
            { new: true }
        ).exec();

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Like error:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports.unlikePost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { likers: req.body.id }
            },
            { new: true }
        ).exec();

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        const updatedUser = await UserModel.findByIdAndUpdate(
            req.body.id,
            {
                $pull: { likes: req.params.id }
            },
            { new: true }
        ).exec();

        if (!updatedUser) {
            return res.status(404).send("User not found");
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Unlike error:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports.commentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
        return res.status(400).send("ID unknown : " + req.params.id);

    try {
        const updatedPost = await PostModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    comments: {
                        commenterId: req.body.commenterId,
                        commenterPseudo: req.body.commenterPseudo,
                        text: req.body.text,
                        timestamp: new Date().getTime(),
                    },
                },
            },
            { new: true }
        ).exec();

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        res.status(200).json(updatedPost);
    } catch (err) {
        console.error("Comment error:", err);
        res.status(500).send("Internal server error");
    }
};

module.exports.editCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        const updatedPost = await PostModel.findById(req.params.id).exec();

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        const theComment = updatedPost.comments.find((comment) =>
            comment._id.equals(req.body.commentId)
        );

        if (!theComment) {
            return res.status(404).send("Comment not found");
        }

        theComment.text = req.body.text;

        const savedPost = await updatedPost.save();

        return res.status(200).json(savedPost);
    } catch (err) {
        console.error("Edit comment error:", err);
        return res.status(500).send("Internal server error");
    }
};

module.exports.deleteCommentPost = async (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400).send("ID unknown : " + req.params.id);
    }

    try {
        const updatedPost = await PostModel.findById(req.params.id).exec();

        if (!updatedPost) {
            return res.status(404).send("Post not found");
        }

        const commentIndex = updatedPost.comments.findIndex((comment) =>
            comment._id.equals(req.body.commentId)
        );

        if (commentIndex === -1) {
            return res.status(404).send("Comment not found");
        }

        updatedPost.comments.splice(commentIndex, 1);

        const savedPost = await updatedPost.save();

        return res.status(200).json(savedPost);
    } catch (err) {
        console.error("Delete comment error:", err);
        return res.status(500).send("Internal server error");
    }
};
