export function successResponse(
  data: { items?: any[]; item?: {}; count?: number },
  message?: string,
  statusCode?: number,
) {
  return {
    data: data.items || data.item || {},
    count: data.count || 0,
    success: true,
    message: message || '',
    status: statusCode || 200,
  };
}

export function errorResponse(
  message: string,
  statusCode?: number,
  json: any = null,
) {
  if (typeof json === 'object' && json !== null) {
    message = json.message || message;
  }
  return {
    data: json,
    success: false,
    message: message || '',
    status: statusCode || 500,
  };
}
