import express from "express";
import cors from "cors";
import serviceRouter from "./controllers/service.js";
import slotRouter from "./controllers/slot.js";
import bookingsRouter from "./controllers/bookings.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/service", serviceRouter);
app.use("/slots", slotRouter);
app.use("/bookings", bookingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
