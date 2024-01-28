import { Response } from "express";

export default function errorResponse({
  response,
  error,
  message,
  status,
}: {
  response: Response;
  message: string;
  status: number;
  error: string;
}) {
  return response.status(status).json({
    timestamp: new Date().toISOString(),
    message,
    error,
  });
}
