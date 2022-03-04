import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/events', (req, res) => {
    const { type, data } = req.body;
    console.log('incoming request');


    handleEvent(type, data);

    console.log('current store:');
    console.log(posts);

})

function handleEvent(type, data){
    console.log('handling event: ' + type);
    if(type === 'PostCreated') {
        const {id, title} = data;

        posts[id] = {id, title, comments: []};
    }

    if(type === 'CommentCreated') {
        const {id, content, postId, status} = data;

        const post = posts[postId];
        post.comments.push({id, content, status});
    }

    if(type === 'CommentUpdated') {
        const {id, content, postId, status} = data;

        const post = posts[postId];
        const comment = post.comments.find(comment => {
            return comment.id === id;
        })
        comment.status = status;
        comment.content = content;
    }
    console.log('result...');
    console.log(posts);
}

app.listen((4002), async () => {
    console.log('Listening on 4002');

//    const res = await axios.get('http://event-bus-srv:4005/events');

//    for(let event of res.data) {
//        console.log('Catching up... processing event: ' + event.type);
//        handleEvent(event.type, event.data);
//    }
});