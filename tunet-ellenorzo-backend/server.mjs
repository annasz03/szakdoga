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

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/diseases', diseaseRoutes);
app.use('/api/users', userRoutes);
app.use('/result', resultRoutes);
app.use('/api', userRoutes);
app.use('/api', documentRoutes);
app.use('', forumPosts);
app.use('/api', doctorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Szerver fut: ${PORT}`);
});

cron.schedule('* * * * *', sendScheduledAlerts);
