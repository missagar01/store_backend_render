import { Router } from "express";
import usersRoutes from "./users.routes.js";
import storeIndentRoutes from "./storeIndent.routes.js";
import vendorRateUpdateRoutes from "./vendorRateUpdate.routes.js";
import threePartyApprovalRoutes from "./threePartyApproval.routes.js";
import poRoutes from "./po.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";

const router = Router();

router.use("/users", usersRoutes);
router.use("/store-indent", storeIndentRoutes);
router.use("/vendor-rate-update", vendorRateUpdateRoutes);
router.use("/three-party-approval", threePartyApprovalRoutes);
router.use("/po", poRoutes);
router.use("/auth", authRoutes);
router.use("/health", healthRoutes);

export default router;
