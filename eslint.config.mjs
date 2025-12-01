import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const compat = new FlatCompat({ baseDirectory: process.cwd() });

const config = [
  // Global ignores (prevents parsing of temporary/generated folders)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "temp/**",
    ],
  },

  // Next.js and TypeScript recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Base rules for the app
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "app", pattern: "src/app/*" },
        { type: "portal-components", pattern: "src/components/portal/*" },
        { type: "admin-components", pattern: "src/components/admin/*" },
        { type: "components", pattern: "src/components/*" },
        { type: "hooks", pattern: "src/hooks/*" },
        { type: "lib", pattern: "src/lib/*" },
        { type: "stores", pattern: "src/stores/*" },
      ],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["off", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_", ignoreRestSiblings: true }],
      "react/jsx-no-undef": "error",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/triple-slash-reference": "off",

      // Boundaries rules
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: ["portal-components"],
              disallow: ["admin-components"],
              message: "Portal components should not import Admin components",
            },
            {
              from: ["admin-components"],
              disallow: ["portal-components"],
              message: "Admin components should not import Portal components",
            },
          ],
        },
      ],
    },
  },

  // Looser rules for tests
  {
    files: [
      "tests/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "src/app/**/tests/**",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Scripts and edge/runtime functions can use require and any types as needed
  {
    files: ["scripts/**", "netlify/functions/**", "netlify/plugins/**", "netlify/**"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Allow require in prisma wrapper for lazy client creation
  {
    files: ["src/lib/prisma.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Declaration files and Next generated env types
  {
    files: ["**/*.d.ts", "next-env.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },

  // Enforce withTenantContext in API routes
  {
    files: ["src/app/api/**/route.ts", "src/app/api/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [
          { name: "next-auth", importNames: ["getServerSession"], message: "Use withTenantContext() and requireTenantContext() instead of getServerSession in API routes" },
          { name: "next-auth/next", importNames: ["getServerSession"], message: "Use withTenantContext() and requireTenantContext() instead of getServerSession in API routes" }
        ]
      }],
      "no-restricted-syntax": ["error",
        {
          selector: "CallExpression[callee.name='getServerSession']",
          message: "Use withTenantContext() and requireTenantContext() in API routes"
        }
      ]
    },
  },
  // Forbid raw prisma queries in API routes (allowlist exceptions)
  {
    files: ["src/app/api/**/route.ts", "src/app/api/**/*.ts"],
    ignores: [
      "src/app/api/db-check/route.ts",
      "src/app/api/admin/system/health/route.ts",
      "src/app/api/uploads/av-callback/route.ts"
    ],
    rules: {
      "no-restricted-syntax": ["error",
        {
          selector: "CallExpression[callee.property.name=/^\\$?(queryRaw|executeRaw|queryRawUnsafe|executeRawUnsafe)$/]",
          message: "Use typed Prisma queries or a vetted db.raw helper with explicit tenant scoping. Raw SQL in API routes is restricted."
        }
      ]
    }
  },
  // Forbid direct Prisma client instantiation in src (use shared client)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/lib/prisma.ts"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: "NewExpression[callee.name='PrismaClient']", message: "Use the shared prisma client from '@/lib/prisma' instead of instantiating PrismaClient directly." }
      ]
    }
  },
  // Forbid direct Prisma client instantiation in the repo (use shared client)
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js"],
    ignores: ["src/lib/prisma.ts"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: "NewExpression[callee.name='PrismaClient']", message: "Use the shared prisma client from '@/lib/prisma' instead of instantiating PrismaClient directly." }
      ]
    }
  }
];

export default config;
