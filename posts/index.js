import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import { randomBytes } from 'crypto';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = [];

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', (req, res) => {
    // create post
    const newPost = createPost(req);

    // add to store
    posts.push(newPost);

    // send post
    axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: newPost
    }).catch((err) => console.log(err));

    // log current store
    console.log(newPost);

    // send response
    res.status(201).send(posts);
});

app.post('/events', (req, res) => {
    console.log('Receieved Event from bus: ' + req.body.type);
    res.send({});
});

app.listen(4000, () => {
    console.log('listening on 4000...');
});

function createPost(req) {
    return {
        id: randomBytes(4).toString('hex'),
        title: req.body.title
    };
}

function logCurrentStore() {
    console.log();
    console.log('updated posts...');
    console.log(posts);
    console.log();
}