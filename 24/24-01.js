import express from 'express';
import { createClient } from 'webdav';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

const client = createClient(
    "https://webdav.yandex.ru",
    {
        username: "oreschkok@yandex.by",
        password: "vfsxvmgonjqiukss"
    }
);

app.post('/md/:dirname', async (req, res) => {
    try {
        const dirName = req.params.dirname;
        const exists = await client.exists(dirName);
        
        if (exists) {
            return res.status(408).send('Directory already exists');
        }

        await client.createDirectory(dirName);
        res.status(200).send('Directory created successfully');
    } catch (error) {
        console.error('Error creating directory:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/rd/:dirname', async (req, res) => {
    try {
        const dirName = req.params.dirname;
        const exists = await client.exists(dirName);
        
        if (!exists) {
            return res.status(408).send('Directory does not exist');
        }

        await client.deleteFile(dirName);
        res.status(200).send('Directory removed successfully');
    } catch (error) {
        console.error('Error removing directory:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/up/:filename', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const fileName = req.params.filename;
        const fileContent = fs.createReadStream(req.file.path);

        await client.putFileContents(fileName, fileContent);
        
        fs.unlinkSync(req.file.path);
        
        res.status(200).send('File uploaded successfully');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(408).send('Error uploading file');
    }
});

app.post('/down/:filename', async (req, res) => {
    try {
        const fileName = req.params.filename;
        const exists = await client.exists(fileName);
        
        if (!exists) {
            return res.status(404).send('File not found');
        }

        const fileContent = await client.getFileContents(fileName);
        res.send(fileContent);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/del/:filename', async (req, res) => {
    try {
        const fileName = req.params.filename;
        const exists = await client.exists(fileName);
        
        if (!exists) {
            return res.status(404).send('File not found');
        }

        await client.deleteFile(fileName);
        res.status(200).send('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Internal server error');
    }
});

app.post('/copy/:source/:destination', async (req, res) => {
    try {
        const sourcePath = req.params.source;
        const destPath = req.params.destination;
        
        const exists = await client.exists(sourcePath);
        if (!exists) {
            return res.status(404).send('Source file not found');
        }

        await client.copyFile(sourcePath, destPath);
        res.status(200).send('File copied successfully');
    } catch (error) {
        console.error('Error copying file:', error);
        res.status(408).send('Error copying file');
    }
});

app.post('/move/:source/:destination', async (req, res) => {
    try {
        const sourcePath = req.params.source;
        const destPath = req.params.destination;
        
        const exists = await client.exists(sourcePath);
        if (!exists) {
            return res.status(404).send('Source file not found');
        }

        await client.moveFile(sourcePath, destPath);
        res.status(200).send('File moved successfully');
    } catch (error) {
        console.error('Error moving file:', error);
        res.status(408).send('Error moving file');
    }
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 