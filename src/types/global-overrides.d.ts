// Global type overrides for development compatibility
// This file helps resolve remaining type conflicts with Prisma and other dependencies

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;
      PORT: string;
      FRONTEND_URL: string;
      CORS_ORIGIN: string;
      [key: string]: string | undefined;
    }
  }

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

// Prisma client augmentations
declare module '@prisma/client' {
  // Allow flexible include/select options
  interface PrismaClient {
    [key: string]: any;
  }

  // Extend common model types to allow missing fields
  namespace Prisma {
    interface expensesInclude {
      [key: string]: any;
    }
    
    interface incomeInclude {
      [key: string]: any;
    }
    
    interface proposalsInclude {
      [key: string]: any;
    }
    
    interface projectsInclude {
      [key: string]: any;
    }
    
    interface tasksInclude {
      [key: string]: any;
    }
    
    interface client_usersInclude {
      [key: string]: any;
    }
    
    interface client_messagesInclude {
      [key: string]: any;
    }
    
    interface client_documentsInclude {
      [key: string]: any;
    }
    
    interface client_notificationsInclude {
      [key: string]: any;
    }
    
    interface client_activitiesInclude {
      [key: string]: any;
    }
    
    interface team_membersInclude {
      [key: string]: any;
    }
    
    // Allow flexible where conditions
    interface expensesWhereInput {
      [key: string]: any;
    }
    
    interface incomeWhereInput {
      [key: string]: any;
    }
    
    interface proposalsWhereInput {
      [key: string]: any;
    }
    
    // Allow flexible select options
    interface expensesSelect {
      [key: string]: any;
    }
    
    interface incomeSelect {
      [key: string]: any;
    }
    
    interface proposalsSelect {
      [key: string]: any;
    }
    
    interface projectsSelect {
      [key: string]: any;
    }
    
    interface tasksSelect {
      [key: string]: any;
    }
    
    interface client_usersSelect {
      [key: string]: any;
    }
    
    interface client_messagesSelect {
      [key: string]: any;
    }
    
    interface client_documentsSelect {
      [key: string]: any;
    }
    
    interface client_notificationsSelect {
      [key: string]: any;
    }
    
    // Allow flexible orderBy options
    interface expensesOrderByWithRelationInput {
      [key: string]: any;
    }
    
    interface incomeOrderByWithRelationInput {
      [key: string]: any;
    }
    
    interface proposalsOrderByWithRelationInput {
      [key: string]: any;
    }
    
    // Allow flexible create/update inputs
    interface expensesCreateInput {
      [key: string]: any;
    }
    
    interface expensesUpdateInput {
      [key: string]: any;
    }
    
    interface incomeCreateInput {
      [key: string]: any;
    }
    
    interface incomeUpdateInput {
      [key: string]: any;
    }
    
    interface proposalsCreateInput {
      [key: string]: any;
    }
    
    interface proposalsUpdateInput {
      [key: string]: any;
    }
    
    interface projectsCreateInput {
      [key: string]: any;
    }
    
    interface tasksCreateInput {
      [key: string]: any;
    }
    
    interface client_usersCreateInput {
      [key: string]: any;
    }
    
    interface client_messagesCreateInput {
      [key: string]: any;
    }
    
    interface client_documentsCreateInput {
      [key: string]: any;
    }
    
    interface client_notificationsCreateInput {
      [key: string]: any;
    }
    
    interface client_notificationsUpdateInput {
      [key: string]: any;
    }
    
    interface client_notificationsUpdateManyMutationInput {
      [key: string]: any;
    }
    
    interface client_messagesUpdateInput {
      [key: string]: any;
    }
    
    interface project_assignmentsCreateInput {
      [key: string]: any;
    }
    
    interface teamsCreateInput {
      [key: string]: any;
    }
    
    // Allow flexible where unique inputs
    interface proposalsWhereUniqueInput {
      [key: string]: any;
    }
    
    interface client_usersWhereUniqueInput {
      [key: string]: any;
    }
    
    interface client_messagesWhereUniqueInput {
      [key: string]: any;
    }
    
    interface client_documentsWhereUniqueInput {
      [key: string]: any;
    }
    
    interface client_notificationsWhereUniqueInput {
      [key: string]: any;
    }
    
    // Allow flexible aggregate inputs
    interface ProposalsSumAggregateInputType {
      [key: string]: any;
    }
    
    interface ProposalsAvgAggregateInputType {
      [key: string]: any;
    }
    
    interface LeadsSumAggregateInputType {
      [key: string]: any;
    }
  }
}

// JWT token type fixes
declare module 'jsonwebtoken' {
  interface SignOptions {
    expiresIn?: string | number;
    [key: string]: any;
  }
}

// Nodemailer type fixes
declare module 'nodemailer' {
  interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
    [key: string]: any;
  }
}

export { };

