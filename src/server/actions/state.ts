export type ActionStatus = "idle" | "error" | "success";

export type ActionResult = {
  message: string;
  status: ActionStatus;
};

export const idleActionResult: ActionResult = {
  message: "",
  status: "idle",
};

export function actionError(message: string): ActionResult {
  return {
    message,
    status: "error",
  };
}

export function actionSuccess(message: string): ActionResult {
  return {
    message,
    status: "success",
  };
}
