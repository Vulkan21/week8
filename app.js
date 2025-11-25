export default (express, bodyParser, createReadStream, crypto, http, CORS, writeFileSync) => {
  const app = express();
  
  // Middleware
  app.use(CORS());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set('trust proxy', 1);
  
  const LOGIN = 'c5803a15-0cfc-4719-ab77-c604044c9c5a';
  const WORDPRESS_URL = process.env.WORDPRESS_URL;
  
  // Route 1: /login/ - returns login as plain text
  app.get('/login/', (req, res) => {
    res.type('text/plain');
    res.send(LOGIN);
  });
  
  // Route 2: /render/ - renders pug template with provided data
  app.post('/render/', async (req, res) => {
    try {
      const { random2, random3 } = req.body;
      const { addr } = req.query;
      
      if (!addr) {
        return res.status(400).send('Missing addr parameter');
      }
      
      if (!random2 || !random3) {
        return res.status(400).send('Missing random2 or random3 in request body');
      }
      
      const response = await fetch(addr);
      if (!response.ok) {
        return res.status(500).send('Failed to fetch template');
      }
      
      const templateContent = await response.text();
      const pug = await import('pug');
      const compiledFunction = pug.compile(templateContent);
      const html = compiledFunction({ random2, random3 });
      
      res.type('text/html');
      res.send(html);
    } catch (error) {
      console.error('Error in /render/:', error);
      res.status(500).send('Error rendering template: ' + error.message);
    }
  });
  
  // Route 3: /wordpress/ - proxy to WordPress instance or mock
  app.all('/wordpress*', async (req, res) => {
    try {
      // Extract path after /wordpress
      const wpPath = req.path.replace('/wordpress', '') || '/';
      
      // If no WordPress URL configured, return mock data
      if (!WORDPRESS_URL) {
        // Mock WordPress REST API response
        if (wpPath.startsWith('/wp-json/wp/v2/posts/1')) {
          return res.json({
            id: 1,
            title: { rendered: LOGIN },
            content: { rendered: `<p>Post with login ${LOGIN}</p>` },
            excerpt: { rendered: `<p>Post with login ${LOGIN}</p>` },
            status: 'publish',
            link: `${req.protocol}://${req.get('host')}/wordpress/?p=1`
          });
        }
        
        if (wpPath === '/wp-json/wp/v2/posts' || wpPath === '/wp-json/wp/v2/posts/') {
          return res.json([{
            id: 1,
            title: { rendered: LOGIN },
            content: { rendered: `<p>Post with login ${LOGIN}</p>` },
            excerpt: { rendered: `<p>Post with login ${LOGIN}</p>` },
            status: 'publish',
            link: `${req.protocol}://${req.get('host')}/wordpress/?p=1`
          }]);
        }
        
        // Mock main page
        return res.send(`
<!DOCTYPE html>
<html>
<head><title>${LOGIN}</title></head>
<body>
<h1>${LOGIN}</h1>
<article><h2>${LOGIN}</h2><p>Post with login ${LOGIN}</p></article>
</body>
</html>`);
      }
      
      // Proxy to real WordPress
      const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      const targetUrl = `${WORDPRESS_URL}${wpPath}${queryString}`;
      
      const fetchOptions = {
        method: req.method,
        headers: { ...req.headers, host: new URL(WORDPRESS_URL).host }
      };
      
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(req.body);
      }
      
      const response = await fetch(targetUrl, fetchOptions);
      const contentType = response.headers.get('content-type');
      
      response.headers.forEach((value, key) => {
        if (key !== 'transfer-encoding' && key !== 'connection') {
          res.setHeader(key, value);
        }
      });
      
      res.status(response.status);
      if (contentType) res.type(contentType);
      
      const body = await response.text();
      
      if (contentType && contentType.includes('text/html')) {
        const modifiedBody = body
          .replace(new RegExp(WORDPRESS_URL, 'g'), '/wordpress')
          .replace(/href="\/(?!wordpress)/g, 'href="/wordpress/')
          .replace(/src="\/(?!wordpress)/g, 'src="/wordpress/');
        res.send(modifiedBody);
      } else {
        res.send(body);
      }
      
    } catch (error) {
      console.error('Error in /wordpress/:', error);
      res.status(500).send('Error accessing WordPress: ' + error.message);
    }
  });
  
  return app;
};

