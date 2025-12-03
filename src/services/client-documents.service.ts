// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { ForbiddenError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class ClientDocumentsService {
  /**
   * Get documents for client
   */
  async getDocuments(
    contactId: string,
    page: number = 1,
    limit: number = 20,
    type?: string,
    projectId?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      contact_id: contactId,
    };

    if (type) {
      where.type = type;
    }

    if (projectId) {
      where.project_id = projectId;
    }

    const [documents, total] = await Promise.all([
      prisma.client_documents.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.client_documents.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string, contactId: string) {
    const document = await prisma.client_documents.findUnique({
      where: { id: documentId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.contact_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    return document;
  }

  /**
   * Upload document (internal - called after file upload)
   */
  async createDocument(data: {
    contact_id: string;
    project_id?: string;
    name: string;
    description?: string;
    type: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_by?: string;
  }) {
    return await prisma.client_documents.create({
      data,
    });
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, contactId: string) {
    const document = await prisma.client_documents.findUnique({
      where: { id: documentId },
      select: { contact_id: true, file_path: true },
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    if (document.contact_id !== contactId) {
      throw new ForbiddenError('Access denied');
    }

    // Delete from database
    await prisma.client_documents.delete({
      where: { id: documentId },
    });

    // TODO: Delete physical file from storage
    // This would typically use a file storage service

    return { success: true, message: 'Document deleted' };
  }

  /**
   * Get document types/categories
   */
  async getDocumentTypes(contactId: string) {
    const types = await prisma.client_documents.groupBy({
      by: ['type'],
      where: { contact_id: contactId },
      _count: {
        type: true,
      },
    });

    return types.map(t => ({
      type: t.type,
      count: t._count.type,
    }));
  }
}

export default new ClientDocumentsService();
