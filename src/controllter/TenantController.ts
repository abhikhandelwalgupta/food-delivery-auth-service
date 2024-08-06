/* eslint-disable no-console */
import { NextFunction, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest } from "../types";
import { Logger } from "winston";



export class TenantController {

    constructor(private tenantService: TenantService, private logger: Logger) { }
    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        this.logger.debug("Request for creating a tenats", req.body)
        const { name, address } = req.body;

        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenants has been create")

            res.status(201).json({ id: tenant.id })
        } catch (error) {
            next(error)
        }
    }
}