import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import {randomBytes} from 'crypto';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// GET - return comments for a post
app.get('/posts/:id/comments', (req, res) => {
    const commentsForPost = commentsByPostId[req.params.id] ? commentsByPostId[req.params.id] : [];
    res.status(200).send(commentsForPost);
});

// POST - add comment for post
app.post('/posts/:id/comments', (req, res) => {
    // create comment
    const comment = createComment(req);

    // add comment to store
    const comments = commentsByPostId[comment.postId] || [];
    comments.push(comment);
    commentsByPostId[comment.postId] = comments;

    // send event to event-bus
//    axios.post('http://event-bus-srv:4005/events', {
//        type: 'CommentCreated',
//        data: comment
//    });

    // log current store
    logCurrentCommentsForPost(comment.postId);

    // return response
    res.status(201).send(comment);
});

// POST - handles events emmitted from event-bus
app.post('/events', async (req, res) => {
    console.log('Receieved Event from bus: ' + req.body.type);

    const {type, data} = req.body;

    if(type === 'CommentModerated') {
        const { postId, id, status, content } = data;

        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id === id;
        });
        comment.status = status;

//        await axios.post('http://event-bus-srv:4005/events', {
//            type: 'CommentUpdated',
//            data: {
//                id,
//                status,
//                postId,
//                content
//            }
//        });
    }
    res.send({});
});

app.listen(4001, () => {
    console.log('listening on 4001');
})

function createComment(req) {
    return {
        id: randomBytes(4).toString('hex'),
        content: req.body.content,
        postId: req.params.id,
        status: 'pending'
    }
}

function logCurrentCommentsForPost(postId) {
    console.log();
    console.log('updated comments for post...');
    console.log(commentsByPostId[postId]);
    console.log();
}

