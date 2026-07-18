import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Rental API running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api/v1`);
});
