/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { RequestHandler } from "express";
import { TenantController } from "../controllter/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";
import authenticate from "../middlewares/authenticate";
import { canAccess } from "../middlewares/canAccess";
import { Roles } from "../constants";

const router = express.Router();

// /tenants
const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  "/",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.create(req, res, next),
);

router.post(
  "/updateTenant/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.update(req, res, next),
);
router.delete(
  "/deleteTenant/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);
router.get(
  "/getTenants",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.getAll(req, res, next),
);
router.get(
  "/getTenants/:id",
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.getAll(req, res, next),
);
export default router;
