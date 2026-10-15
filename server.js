// Starts the API. Azure App Service supplies the port in process.env.PORT.
const app = require('./src/app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[SERVER] ${new Date().toISOString()}  Health Risk API listening on port ${port}`);
});
