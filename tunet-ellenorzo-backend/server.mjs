import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import './config/firebase.mjs';
import diseaseRoutes from './routes/diseaseRoutes.mjs';
import userRoutes from './routes/userRoutes.mjs';
import cron from 'node-cron';
import { sendScheduledAlerts } from './services/alertService.mjs';
import resultRoutes from './routes/diseaseRoutes.mjs';
import documentRoutes from './routes/documentRoutes.mjs';
import forumPosts from './routes/forumPosts.mjs';
import doctorRoutes from './routes/doctorRoutes.mjs';
import alertRoutes from './routes/alertRoutes.mjs';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/', diseaseRoutes);
app.use('/api', diseaseRoutes);
app.use('/api/users', userRoutes);
app.use('/', userRoutes);
app.use('/result', resultRoutes);
app.use('/', resultRoutes);
app.use('/api', userRoutes);
app.use('/', userRoutes);
app.use('/api', documentRoutes);
app.use('/', documentRoutes);
app.use('', forumPosts);
app.use('/', forumPosts);
app.use('/api', forumPosts);
app.use('/api', doctorRoutes);
app.use('/', doctorRoutes);
app.use('/api', alertRoutes);
app.use('/', alertRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: ${PORT}`);
});

cron.schedule('* * * * *', sendScheduledAlerts);
