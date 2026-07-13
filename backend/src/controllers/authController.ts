import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middleware/auth";
import * as authService from "../services/authService";

export const registerHandler = asyncHandler(async (req, res: Response) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(result);
});

export const refreshHandler = asyncHandler(async (req, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  res.status(200).json(result);
});

export const logoutHandler = asyncHandler(async (req, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await authService.getMe(req.userId!);
  res.status(200).json({ user });
});
