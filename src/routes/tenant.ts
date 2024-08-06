/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { TenantController } from "../controllter/TenantController";
import { TenantService } from "../services/TenantService";
import { AppDataSource } from "../config/data-source";
import { Tenant } from "../entity/Tenant";
import logger from "../config/logger";

const router = express.Router();

// /tenants
const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService,logger);
router.post("/", (req, res,next) => tenantController.create(req,res,next));
export default router;
