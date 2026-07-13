import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import * as applicationService from "../services/applicationService";

export const listApplicationsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const applications = await applicationService.listApplications(req.userId!);
  res.json({ applications });
});

export const getApplicationStatsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const stats = await applicationService.getApplicationStats(req.userId!);
  res.json({ stats });
});

export const createApplicationHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.createApplication(req.userId!, req.body);
  res.status(201).json({ application });
});

export const updateApplicationHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const application = await applicationService.updateApplication(req.userId!, req.params.id, req.body);
  res.json({ application });
});

export const deleteApplicationHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await applicationService.deleteApplication(req.userId!, req.params.id);
  res.status(204).send();
});
