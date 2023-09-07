# Image Compression Cloudflare Worker

This Cloudflare Worker script is designed to compress images received from a Figma plugin. It uses the [Resmush.it API](http://api.resmush.it/) to perform the compression. Images are sent as Data URLs, and the worker responds with a compressed Data URL and the compression percentage.

## Prerequisites

Before you can use this Cloudflare Worker, make sure you have the following prerequisites:

- A Cloudflare account and access to the Cloudflare Workers platform.
- Figma plugin or another source that generates and sends image data as Data URLs to the worker.

## Getting Started

Follow these steps to set up and deploy the Cloudflare Worker:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/zendyani/image-compression-worker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd image-compression-worker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Configure your Cloudflare account:

   - Make sure you have your Cloudflare account configured properly.
   - Obtain your Cloudflare API key.

5. Configure the worker:

   - Update the `wrangler.toml` file with your Cloudflare account ID and API key.

6. Deploy the worker:

   ```bash
   npm run deploy
   ```

7. Note the endpoint URL where your worker is deployed. You'll need this URL to send image data for compression.

## Usage

To use this Cloudflare Worker, you need to send a POST request to the worker's endpoint with the image data in the request body. Here's an example of how to do this:

### Request

Make a POST request to your worker's endpoint with the following headers:

- `Content-Type`: `application/json`

And the request body should be a JSON object with the following properties:

- `id`: Unique identifier for the image.
- `name`: Name of the image file.
- `ext`: File extension (e.g., "jpg", "png").
- `size`: Size of the image.
- `dataUrl`: Data URL of the image to be compressed.

Example request:

```json
POST https://your-worker-endpoint-url
Headers:
- Content-Type: application/json
Body:
{
  "id": "123",
  "name": "sample.jpg",
  "ext": "jpg",
  "size": 123456,
  "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

### Response

The worker will respond with a JSON object containing the following properties:

- `id`: The unique identifier for the image.
- `name`: The name of the compressed image file.
- `ext`: The file extension of the compressed image.
- `percent`: The compression percentage achieved.
- `dataUrl`: The Data URL of the compressed image.

Example response:

```json
{
  "id": "123",
  "name": "sample_compressed.jpg",
  "ext": "jpg",
  "percent": 50,
  "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

## Error Handling

The worker handles errors and returns appropriate error responses with status code 500 in case of any issues during image compression.

## CORS Configuration

The worker is configured to allow Cross-Origin Resource Sharing (CORS) for any domain with the following headers:

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, api-key`

Make sure to adjust the CORS configuration as needed for your specific use case.

## Contributing

Feel free to contribute to this project by opening issues, providing feedback, or submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.