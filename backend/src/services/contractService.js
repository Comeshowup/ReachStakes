/**
 * Contract Service
 * Template management, usage rights, and document generation
 */

import { prisma } from '../config/db.js';

// ============================================
// SYSTEM TEMPLATES (Pre-built)
// ============================================

const SYSTEM_TEMPLATES = [
    {
        name: 'Standard Collaboration Agreement',
        description: 'Standard influencer collaboration contract covering deliverables, payment, and timeline.',
        category: 'Collaboration',
        content: `
# INFLUENCER COLLABORATION AGREEMENT

**Date:** {{date}}

**BETWEEN:**
- **Brand:** {{brand_name}} ("Brand")
- **Creator:** {{creator_name}} ("Creator")

---

## 1. CAMPAIGN DETAILS
- **Campaign Title:** {{campaign_title}}
- **Description:** {{campaign_description}}

## 2. DELIVERABLES
{{deliverables}}

## 3. TIMELINE
- **Start Date:** {{start_date}}
- **Deadline:** {{end_date}}
- **Content Review Period:** 48 hours from submission

## 4. COMPENSATION
- **Payment Amount:** \${{payment_amount}}
- **Payment Terms:** {{payment_terms}}
- **Payment Method:** Via Reachstakes platform

## 5. CONTENT RIGHTS
The Brand is granted the following rights to use Creator's content:
- **Usage Type:** {{usage_type}}
- **Territory:** {{territory}}
- **Duration:** {{duration}}

## 6. EXCLUSIVITY
{{exclusivity_clause}}

## 7. CONFIDENTIALITY
All campaign details, briefs, and communications shall remain confidential.

## 8. SIGNATURES

**Brand Representative:**
_________________________
{{brand_signatory}}         Date: ________

**Creator:**
_________________________
{{creator_name}}           Date: ________
`,
        variables: [
            { key: 'brand_name', label: 'Brand Name', type: 'text' },
            { key: 'creator_name', label: 'Creator Name', type: 'text' },
            { key: 'campaign_title', label: 'Campaign Title', type: 'text' },
            { key: 'campaign_description', label: 'Campaign Description', type: 'textarea' },
            { key: 'deliverables', label: 'Deliverables', type: 'textarea' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'payment_amount', label: 'Payment Amount', type: 'number' },
            { key: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['Net-30', 'Net-15', 'Upon Approval'] },
            { key: 'usage_type', label: 'Usage Type', type: 'select', options: ['Organic Only', 'Paid Ads', 'All Media'] },
            { key: 'territory', label: 'Territory', type: 'select', options: ['United States', 'North America', 'Europe', 'Global'] },
            { key: 'duration', label: 'Duration', type: 'select', options: ['6 months', '1 year', '2 years', 'Perpetual'] },
            { key: 'exclusivity_clause', label: 'Exclusivity', type: 'select', options: ['No exclusivity required', '30-day exclusivity in category', '90-day exclusivity in category'] }
        ]
    },
    {
        name: 'Non-Disclosure Agreement (NDA)',
        description: 'Confidentiality agreement for campaign briefings and unreleased products.',
        category: 'NDA',
        content: `
# NON-DISCLOSURE AGREEMENT

**Date:** {{date}}

**BETWEEN:**
- **Disclosing Party:** {{brand_name}} ("Brand")
- **Receiving Party:** {{creator_name}} ("Creator")

---

## 1. PURPOSE
The Brand intends to disclose certain confidential information to the Creator for the purpose of:
{{purpose}}

## 2. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes:
- Product information, launches, and announcements
- Marketing strategies and campaign details
- Business plans and financial information
- Any materials marked as "Confidential"

## 3. OBLIGATIONS
The Creator agrees to:
- Keep all Confidential Information strictly confidential
- Not disclose to any third party without written consent
- Use the information solely for the stated purpose
- Return or destroy all materials upon request

## 4. DURATION
This Agreement shall remain in effect for {{duration}} from the date of signing.

## 5. EXCLUSIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed

## 6. SIGNATURES

**Brand Representative:**
_________________________
Date: ________

**Creator:**
_________________________
{{creator_name}}           Date: ________
`,
        variables: [
            { key: 'brand_name', label: 'Brand Name', type: 'text' },
            { key: 'creator_name', label: 'Creator Name', type: 'text' },
            { key: 'purpose', label: 'Purpose/Project', type: 'textarea' },
            { key: 'duration', label: 'Duration', type: 'select', options: ['1 year', '2 years', '5 years', 'Indefinite'] }
        ]
    },
    {
        name: 'Content Usage Rights',
        description: 'Agreement granting specific usage rights for creator content.',
        category: 'UsageRights',
        content: `
# CONTENT USAGE RIGHTS AGREEMENT

**Date:** {{date}}

**BETWEEN:**
- **License Holder:** {{brand_name}} ("Brand")
- **Content Owner:** {{creator_name}} ("Creator")

---

## 1. CONTENT DESCRIPTION
{{content_description}}

## 2. RIGHTS GRANTED
The Creator grants the Brand the following non-exclusive rights:

- **Usage Type:** {{usage_type}}
- **Territory:** {{territory}}
- **Duration:** {{duration}}
- **Platforms:** {{platforms}}

## 3. RESTRICTIONS
The Brand agrees to:
- Credit the Creator as specified: {{credit_requirement}}
- Not alter the content without approval (unless specified)
- Not sublicense without written consent

## 4. COMPENSATION
{{compensation}}

## 5. OWNERSHIP
The Creator retains all ownership rights to the original content.

## 6. TERMINATION
This license may be terminated:
- Upon expiration of the duration
- By mutual written agreement
- Upon breach of terms (30-day cure period)

## 7. SIGNATURES

**Brand Representative:**
_________________________
Date: ________

**Creator:**
_________________________
{{creator_name}}           Date: ________
`,
        variables: [
            { key: 'brand_name', label: 'Brand Name', type: 'text' },
            { key: 'creator_name', label: 'Creator Name', type: 'text' },
            { key: 'content_description', label: 'Content Description', type: 'textarea' },
            { key: 'usage_type', label: 'Usage Type', type: 'select', options: ['Organic Posts', 'Paid Advertising', 'Website', 'Email Marketing', 'All Media'] },
            { key: 'territory', label: 'Territory', type: 'select', options: ['United States', 'North America', 'Europe', 'Global'] },
            { key: 'duration', label: 'Duration', type: 'select', options: ['6 months', '1 year', '2 years', 'Perpetual'] },
            { key: 'platforms', label: 'Platforms', type: 'text' },
            { key: 'credit_requirement', label: 'Credit Requirement', type: 'text' },
            { key: 'compensation', label: 'Compensation', type: 'textarea' }
        ]
    }
];

// ============================================
// TEMPLATE MANAGEMENT
// ============================================

/**
 * Seed system templates (run on app startup)
 */
export const seedSystemTemplates = async () => {
    for (const template of SYSTEM_TEMPLATES) {
        const existing = await prisma.contractTemplate.findFirst({
            where: {
                name: template.name,
                isSystem: true
            }
        });

        if (!existing) {
            await prisma.contractTemplate.create({
                data: {
                    ...template,
                    isSystem: true,
                    isActive: true
                }
            });
            console.log(`Created system template: ${template.name}`);
        }
    }
};

/**
 * Get all available templates (system + brand custom)
 */
export const getTemplates = async (brandId = null) => {
    const where = {
        isActive: true,
        OR: [
            { isSystem: true },
            { brandId: brandId }
        ].filter(Boolean)
    };

    return prisma.contractTemplate.findMany({
        where,
        orderBy: [
            { isSystem: 'desc' },
            { usageCount: 'desc' }
        ]
    });
};

/**
 * Get template by ID
 */
export const getTemplateById = async (templateId) => {
    return prisma.contractTemplate.findUnique({
        where: { id: templateId }
    });
};

/**
 * Create custom template for a brand
 */
export const createTemplate = async (brandId, data) => {
    return prisma.contractTemplate.create({
        data: {
            brandId,
            name: data.name,
            description: data.description,
            category: data.category || 'Custom',
            content: data.content,
            variables: data.variables || [],
            isSystem: false,
            isActive: true
        }
    });
};

/**
 * Update a template
 */
export const updateTemplate = async (templateId, brandId, data) => {
    // Verify ownership (can't edit system templates)
    const template = await prisma.contractTemplate.findFirst({
        where: {
            id: templateId,
            brandId: brandId,
            isSystem: false
        }
    });

    if (!template) {
        throw new Error('Template not found or cannot be edited');
    }

    return prisma.contractTemplate.update({
        where: { id: templateId },
        data
    });
};

/**
 * Delete a template (soft delete)
 */
export const deleteTemplate = async (templateId, brandId) => {
    const template = await prisma.contractTemplate.findFirst({
        where: {
            id: templateId,
            brandId: brandId,
            isSystem: false
        }
    });

    if (!template) {
        throw new Error('Template not found or cannot be deleted');
    }

    return prisma.contractTemplate.update({
        where: { id: templateId },
        data: { isActive: false }
    });
};

// ============================================
// DOCUMENT GENERATION
// ============================================

/**
 * Generate document from template with variable substitution
 */
export const generateFromTemplate = async (templateId, variables, metadata) => {
    const template = await prisma.contractTemplate.findUnique({
        where: { id: templateId }
    });

    if (!template) {
        throw new Error('Template not found');
    }

    // Substitute variables in content
    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value || '');
    }

    // Add date if not provided
    content = content.replace(/{{date}}/g, new Date().toLocaleDateString());

    // Increment usage count
    await prisma.contractTemplate.update({
        where: { id: templateId },
        data: { usageCount: { increment: 1 } }
    });

    // Create document
    const document = await prisma.document.create({
        data: {
            creatorId: metadata.creatorId,
            collaborationId: metadata.collaborationId || null,
            campaignId: metadata.campaignId || null,
            type: template.category === 'NDA' ? 'NDA' : 'Contract',
            title: `${template.name} - ${variables.creator_name || 'Contract'}`,
            description: content,
            status: 'Draft',
            expiresAt: metadata.expiresAt || null
        }
    });

    return {
        document,
        content,
        templateUsed: template.name
    };
};

// ============================================
// USAGE RIGHTS MANAGEMENT
// ============================================

/**
 * Grant usage rights
 */
export const grantUsageRights = async (data) => {
    // Determine end date
    let endDate = null;
    if (data.duration !== 'perpetual') {
        const durationMap = {
            '6 months': 6,
            '1 year': 12,
            '2 years': 24,
            '3 years': 36
        };
        const months = durationMap[data.duration] || 12;
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);
    }

    return prisma.usageRights.create({
        data: {
            documentId: data.documentId,
            collaborationId: data.collaborationId || null,
            contentAssetId: data.contentAssetId || null,
            usageType: data.usageType,
            territory: data.territory,
            duration: data.duration,
            isExclusive: data.isExclusive || false,
            startDate: data.startDate || new Date(),
            endDate,
            grantedBy: data.grantedBy
        }
    });
};

/**
 * Get usage rights for a document/collaboration
 */
export const getUsageRights = async (filters) => {
    const where = {};
    if (filters.documentId) where.documentId = filters.documentId;
    if (filters.collaborationId) where.collaborationId = filters.collaborationId;
    if (filters.contentAssetId) where.contentAssetId = filters.contentAssetId;

    return prisma.usageRights.findMany({
        where,
        orderBy: { grantedAt: 'desc' }
    });
};

/**
 * Revoke usage rights
 */
export const revokeUsageRights = async (rightsId, userId, reason) => {
    const rights = await prisma.usageRights.findUnique({
        where: { id: rightsId }
    });

    if (!rights) {
        throw new Error('Usage rights not found');
    }

    if (rights.revokedAt) {
        throw new Error('Rights already revoked');
    }

    return prisma.usageRights.update({
        where: { id: rightsId },
        data: {
            revokedAt: new Date(),
            revokedBy: userId,
            revokeReason: reason
        }
    });
};

/**
 * Check if usage rights are active
 */
export const checkUsageRights = async (documentId, usageType) => {
    const rights = await prisma.usageRights.findFirst({
        where: {
            documentId,
            usageType,
            revokedAt: null,
            OR: [
                { endDate: null }, // perpetual
                { endDate: { gte: new Date() } } // not expired
            ]
        }
    });

    return {
        hasRights: !!rights,
        rights
    };
};

/**
 * Get audit trail for a document
 */
export const getDocumentAuditTrail = async (documentId) => {
    const [document, usageRights] = await Promise.all([
        prisma.document.findUnique({
            where: { id: documentId },
            include: {
                creator: {
                    select: { name: true, email: true }
                }
            }
        }),
        prisma.usageRights.findMany({
            where: { documentId },
            orderBy: { grantedAt: 'asc' }
        })
    ]);

    if (!document) {
        throw new Error('Document not found');
    }

    // Build audit trail
    const trail = [];

    trail.push({
        action: 'Document Created',
        timestamp: document.createdAt,
        details: { title: document.title, type: document.type }
    });

    if (document.status === 'Pending_Signature') {
        trail.push({
            action: 'Signature Requested',
            timestamp: document.updatedAt,
            details: { status: 'Pending' }
        });
    }

    if (document.signedAt) {
        trail.push({
            action: 'Document Signed',
            timestamp: document.signedAt,
            details: { signedBy: document.signedByName }
        });
    }

    for (const rights of usageRights) {
        trail.push({
            action: 'Usage Rights Granted',
            timestamp: rights.grantedAt,
            details: {
                usageType: rights.usageType,
                territory: rights.territory,
                duration: rights.duration
            }
        });

        if (rights.revokedAt) {
            trail.push({
                action: 'Usage Rights Revoked',
                timestamp: rights.revokedAt,
                details: { reason: rights.revokeReason }
            });
        }
    }

    // Sort by timestamp
    trail.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    return {
        document,
        usageRights,
        auditTrail: trail
    };
};
