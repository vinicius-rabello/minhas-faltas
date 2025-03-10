const posts = [
    {
        username: "Vini",
        title: "Post 1"
    },
    {
        username: "Leo",
        title: "Post 2"
    }
];

const getPosts = (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name));
};

module.exports = { getPosts };