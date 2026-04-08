import serviceModel from "../model/service.model.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

function parsePagination(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function createService(req, res) {
  try {
    const service = await serviceModel.create({
      ...req.body,
      provider: req.user.id,
    });

    return successResponse(res, {
      statusCode: 201,
      message: "Service created successfully",
      data: { service },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to create service", errors: error.message });
  }
}

export async function getServices(req, res) {
  try {
    const { category, location, keyword, minPrice, maxPrice, sortBy = "createdAt", order = "desc" } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    const query = {};

    if (category) query.category = { $regex: category, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sort = { [sortBy]: order === "asc" ? 1 : -1 };

    const [services, total] = await Promise.all([
      serviceModel.find(query).populate("provider", "name email location").sort(sort).skip(skip).limit(limit),
      serviceModel.countDocuments(query),
    ]);

    return successResponse(res, {
      message: "Services fetched successfully",
      data: { services },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch services", errors: error.message });
  }
}

export async function getServiceById(req, res) {
  try {
    const service = await serviceModel.findById(req.params.id).populate("provider", "name email location");
    if (!service) {
      return errorResponse(res, { statusCode: 404, message: "Service not found" });
    }

    return successResponse(res, {
      message: "Service fetched successfully",
      data: { service },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to fetch service", errors: error.message });
  }
}

export async function updateService(req, res) {
  try {
    const service = await serviceModel.findById(req.params.id);
    if (!service) {
      return errorResponse(res, { statusCode: 404, message: "Service not found" });
    }

    const isOwner = service.provider.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: not allowed to update this service" });
    }

    const updatableFields = ["title", "description", "category", "price", "location"];
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        service[field] = req.body[field];
      }
    }

    await service.save();

    return successResponse(res, {
      message: "Service updated successfully",
      data: { service },
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to update service", errors: error.message });
  }
}

export async function deleteService(req, res) {
  try {
    const service = await serviceModel.findById(req.params.id);
    if (!service) {
      return errorResponse(res, { statusCode: 404, message: "Service not found" });
    }

    const isOwner = service.provider.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return errorResponse(res, { statusCode: 403, message: "Forbidden: not allowed to delete this service" });
    }

    await service.deleteOne();

    return successResponse(res, {
      message: "Service deleted successfully",
    });
  } catch (error) {
    return errorResponse(res, { statusCode: 500, message: "Failed to delete service", errors: error.message });
  }
}
