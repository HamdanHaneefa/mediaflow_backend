
// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        permissions: Record<string, any>;
      };
      clientUser?: {
        id: string;
        email: string;
        contactId: string;
        isVerified: boolean;
        contact: {
          id: string;
          name: string;
          company: string | null;
        };
      };
    }
  }
}

export { };

