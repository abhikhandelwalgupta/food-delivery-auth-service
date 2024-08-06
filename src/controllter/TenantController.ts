/* eslint-disable no-console */
import { NextFunction, Request, Response } from "express";
import { TenantService } from "../services/TenantService";
import { CreateTenantRequest, TenantQueryParams } from "../types";
import { Logger } from "winston";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";

export class TenantController {
    constructor(
        private tenantService: TenantService,
        private logger: Logger,
    ) { }


    async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
        this.logger.debug("Request for creating a tenats", req.body);

        const result = validationResult(req);
        console.log("result :- ", result);

        if (!result.isEmpty()) {
            return res.status(400).json({ error: result.array() });
        }

        const { name, address } = req.body;
        try {
            const tenant = await this.tenantService.create({ name, address });
            this.logger.info("Tenants has been create");

            res.status(201).json({ id: tenant.id });
        } catch (error) {
            next(error);
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = req.params.id;

            if (isNaN(Number(tenantId))) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }
            const tenant = await this.tenantService.findById(Number(tenantId));
            if (!tenant) {
                next(createHttpError(400, "Tenant does not exist."));
                return;
            }
            this.logger.info("Tenant has been fetched");
            res.json(tenant);

        } catch (error) {
            next(error)
        }

    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true });
        try {
            const [tenants, count] = await this.tenantService.getAll(
                validatedQuery as TenantQueryParams
            );

            this.logger.info("All tenant have been fetched");
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: tenants,
            });

            res.json(tenants);
        } catch (err) {
            next(err);
        }
    }

    async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }
        this.logger.debug("Request for updating a tenant", req.body);
        try {
            const { name, address } = req.body;
            const tenantId = Number(req.params.id)

            if (isNaN(tenantId)) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }

            await this.tenantService.updateData(tenantId, { name, address })
            this.logger.info("Tenant has been updated", { id: tenantId });

            res.json({ id: Number(tenantId) });

        } catch (error) {
            next(error)
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        try {
            const tenantId = Number(req.params.id);
            if (isNaN(tenantId)) {
                next(createHttpError(400, "Invalid url param."));
                return;
            }
            await this.tenantService.deleteById(Number(tenantId));

            this.logger.info("Tenant has been deleted", {
                id: Number(tenantId),
            });
            res.json({ id: Number(tenantId) });

        } catch (error) {
            next(error)
        }
    }
}

