export type OrderStatus = "PENDING" | "DELIVERED" | "CANCELED" | "ACCEPTED";

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "text-yellow-600 bg-yellow-50";
    case "DELIVERED":
    case "ACCEPTED":
      return "text-green-600 bg-green-50";
    case "CANCELED":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "DELIVERED":
    case "ACCEPTED":
      return "Entregue";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
};

export const getStatusDotColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-400";
    case "DELIVERED":
    case "ACCEPTED":
      return "bg-green-400";
    case "CANCELED":
      return "bg-red-400";
    default:
      return "bg-gray-400";
  }
};
