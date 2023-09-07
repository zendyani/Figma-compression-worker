/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
class Compressor {
    constructor(rawImage) {
        this.imageString = null;
        this.compressionPercent = null;
        try {
            this.imageString = this.getDataFromDataUri(rawImage);
        } catch (error) {
            throw new Error('Invalid data URL provided');
        }
    }

    async compressImage() {
        if (!this.imageString) {
            throw new Error('Image data is missing or invalid');
        }
        const imgMime = this.getFileMimeType();
        const imgName = 'placeholder.' + this.getExtension();
        const imgData = this.imageString;

        const formData = new FormData();
        formData.append('files', new File([imgData], imgName, { type: imgMime }));

        const response = await fetch('http://api.resmush.it/?qlty=95', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to compress image');
        }

        const data = await response.json();
        const compressedImage = await fetch(data.dest);
        this.imageString = await compressedImage.arrayBuffer();
        this.compressionPercent = data.percent;
    }

    getPercent() {
        return this.compressionPercent;
    }

    getFileMimeType() {
        const mimeType = this.imageString.type;
        return mimeType;
    }

    generateImageDataUri() {
        const b64Image = this.arrayBufferToBase64(this.imageString);
        const typeImage = this.getFileMimeType();
        return 'data:' + typeImage + ';base64,' + b64Image;
    }

    getExtension() {
        const ext = "png";
        return ext || 'jpg';
    }

    getDataFromDataUri(raw) {
        if (typeof raw !== 'string') {
            throw new Error('Invalid data URL format');
        }

        const match = raw.match(/^data:(.*?)(;base64)?,(.*)$/);

        if (!match) {
            throw new Error('Invalid data URL format');
        }

        if (match[2] !== ';base64') {
            throw new Error('Data URL is not base64-encoded');
        }

        return this.base64ToArrayBuffer(match[3]);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    arrayBufferToBase64(arrayBuffer) {
        const binaryArray = new Uint8Array(arrayBuffer);
        let binaryString = '';
        for (let i = 0; i < binaryArray.length; i++) {
            binaryString += String.fromCharCode(binaryArray[i]);
        }
        return btoa(binaryString);
    }
}

addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {

    // Check if the request method is POST
    if (request.method === 'POST') {
        // Get the API key from the request headers
        const apiKey = request.headers.get('api-key');

        // Parse the JSON content from the request body
        const content = await request.json();

        const id = content.id;
        const name = content.name;
        const ext = content.ext;
        const size = content.size;
        const image = content.dataUrl;

        const compressor = new Compressor(image);

        try {
            await compressor.compressImage();
            const compressedDataUrl = compressor.generateImageDataUri();
            const percent = compressor.getPercent();

            // Create a JSON response
            const responseJson = {
                id: id,
                name: name,
                ext: ext,
                percent: percent,
                dataUrl: compressedDataUrl,
            };

            const res = new Response(JSON.stringify(responseJson), {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, api-key',
                    'Content-Type': 'application/json'
                },
            });

            return res;

        } catch (error) {
            // Handle errors and return an appropriate response
            const response = new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, api-key',
                    'Content-Type': 'application/json'
                },
            });

            return response;
        }
    }

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204, // No Content for preflight requests
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, api-key',
            },
        });
    }
    // If the request method is not POST, return an error response
    const response = new Response(JSON.stringify({ msg: 'html not generated' }), {
        status: 400,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, api-key',
            'Content-Type': 'application/json'
        },
    });

    return response;
}
