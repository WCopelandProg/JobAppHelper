import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import { prisma } from "../utils/prisma";
import * as networkingService from "../services/networkingService";

export const suggestSearchesHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  const searches = networkingService.buildSuggestedSearches(String(req.query.company), user?.school);
  res.json({ searches });
});

export const listLeadsHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const leads = await networkingService.listLeads(req.userId!);
  res.json({ leads });
});

export const createLeadHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lead = await networkingService.createLead(req.userId!, req.body);
  res.status(201).json({ lead });
});

export const updateLeadHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const lead = await networkingService.updateLead(req.userId!, req.params.id, req.body);
  res.json({ lead });
});

export const deleteLeadHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await networkingService.deleteLead(req.userId!, req.params.id);
  res.status(204).send();
});
