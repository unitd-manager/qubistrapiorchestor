#!/usr/bin/env powershell
# seed-use-cases-page.ps1 — Seeds all Use Cases page content into Strapi

param(
    [string]$StrapiUrl = "http://localhost:1337",
    [string]$ApiToken = "40696bf405e8923483f887176bce96bb24ee09a19010bfc83caff10a5621b565794780f1799447358ff961f466a207f9a98b8cd6dd1ac64ba9008cf31859023156191cc41a2fd623e2793a62d29a255e8cc9f052744fd1c07c362449b10f619769865126f6b1b627f81039e85c223837088ae2691ce5d11dc03fd1ec16b6c943"
)

Set-StrictMode -Off
$ErrorActionPreference = "Stop"

$H = @{ Authorization = "Bearer $ApiToken"; "Content-Type" = "application/json" }
Write-Host "Authenticated. Starting seed..." -ForegroundColor Cyan

# ─── Helpers ────────────────────────────────────────────────────────────────
function Post-Strapi($endpoint, $data) {
    $body = @{ data = $data } | ConvertTo-Json -Depth 6
    return (Invoke-RestMethod -Uri "$StrapiUrl/api/$endpoint" -Method POST -Headers $H -Body $body).data
}

function Get-SectionByType($sectionType) {
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/sections?filters[section_type][$eq]=$sectionType&pagination[pageSize]=1" -Headers $H
    if ($resp.data.Count -gt 0) { return $resp.data[0] }
    return $null
}

function Get-CategoriesBySection($sectionId, $categoryType) {
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/categories?filters[section_id][$eq]=$sectionId&filters[category_type][$eq]=$categoryType&pagination[pageSize]=50" -Headers $H
    return $resp.data
}

function Get-ContentsByType($contentType) {
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/contents?filters[content_type][$eq]=$contentType&pagination[pageSize]=50" -Headers $H
    return $resp.data
}

function Ensure-Section($sectionType, $fields) {
    $existing = Get-SectionByType $sectionType
    if ($existing) {
        Write-Host "  Section '$sectionType' already exists (id=$($existing.id)), skipping." -ForegroundColor Yellow
        return $existing
    }
    $fields["section_type"] = $sectionType
    $fields["published"] = $true
    $created = Post-Strapi "sections" $fields
    Write-Host "  Created section '$sectionType' (id=$($created.id))" -ForegroundColor Green
    return $created
}

function Ensure-Category($sectionId, $categoryType, $categoryTitle, $extraFields) {
    $existing = Get-CategoriesBySection $sectionId $categoryType | Where-Object { $_.category_title -eq $categoryTitle }
    if ($existing) {
        Write-Host "    Category '$categoryTitle' already exists, skipping." -ForegroundColor Yellow
        return $existing
    }
    $data = @{
        section_id     = $sectionId
        category_type  = $categoryType
        category_title = $categoryTitle
        published      = $true
    }
    foreach ($kv in $extraFields.GetEnumerator()) { $data[$kv.Key] = $kv.Value }
    $created = Post-Strapi "categories" $data
    Write-Host "    Created category '$categoryTitle'" -ForegroundColor Green
    return $created
}

function Ensure-Content($contentType, $title, $extraFields) {
    $existing = Get-ContentsByType $contentType | Where-Object { $_.title -eq $title }
    if ($existing) {
        Write-Host "    Content '$title' already exists, skipping." -ForegroundColor Yellow
        return $existing
    }
    $data = @{
        title        = $title
        content_type = $contentType
        published    = $true
    }
    foreach ($kv in $extraFields.GetEnumerator()) { $data[$kv.Key] = $kv.Value }
    $created = Post-Strapi "contents" $data
    Write-Host "    Created content '$title'" -ForegroundColor Green
    return $created
}

# ─── 1. HERO SECTION ────────────────────────────────────────────────────────
Write-Host "`n[Use Cases Page - Hero]" -ForegroundColor Magenta
Ensure-Section "uc_page_hero" @{
    section_title = "Work qBotica Runs for Enterprises"
    description   = "Not demos. Not pilots. Real operations running end-to-end across financial services, healthcare, and enterprise shared services."
    template      = "Real Operations. Real Outcomes."
    display_type  = "Book a Demo"
    external_link = "https://meetings.hubspot.com/maheshv"
    sort_order    = 1
} | Out-Null

# ─── 2. STATS SECTION ───────────────────────────────────────────────────────
Write-Host "`n[Use Cases Page - Stats]" -ForegroundColor Magenta
$stats = Ensure-Section "uc_page_stats" @{
    section_title = "Results at scale"
    sort_order    = 2
}
$statItems = @(
    @{ value = "85%";  label = "Reduction in processing time"; order = 1 },
    @{ value = "10x";  label = "Increase in throughput";       order = 2 },
    @{ value = "Zero"; label = "Manual intervention needed";   order = 3 },
    @{ value = "99.2%"; label = "Accuracy rate achieved";      order = 4 }
)
foreach ($item in $statItems) {
    Ensure-Category $stats.id "stat_item" $item.label @{ description_short = $item.value; sort_order = $item.order } | Out-Null
}

# ─── 3. USE CASES GRID HEADING ──────────────────────────────────────────────
Write-Host "`n[Use Cases Page - Grid heading]" -ForegroundColor Magenta
Ensure-Section "uc_page_grid" @{
    section_title = "Most AI stops here. We don't."
    description   = "We don't automate tasks. We execute outcomes - end-to-end, continuously, as a managed service."
    template      = "Use Cases"
    sort_order    = 3
} | Out-Null

# ─── 4. USE CASE CARDS (contents) ───────────────────────────────────────────
# Fields: title, type=icon key, external_link=industry, description, description_short=pipe-separated outcomes
Write-Host "`n[Use Cases Page - Use case cards]" -ForegroundColor Magenta
$useCaseItems = @(
    @{
        title  = "Invoice Processing & ERP Posting"
        icon   = "DollarSign"
        industry = "Financial Services"
        desc   = "From document intake to validated ERP posting with zero manual touch. AI reads invoices, validates against POs, resolves exceptions, and posts - end-to-end."
        outcomes = "21 days to 2 days processing|95% accuracy|$2M annual savings"
        order  = 1
    },
    @{
        title  = "Claims Intake to Adjudication"
        icon   = "HeartPulse"
        industry = "Healthcare & Insurance"
        desc   = "End-to-end claims processing with AI-driven decisions. Extract claim data, validate against policy rules, route complex cases, and adjudicate - automatically."
        outcomes = "60% reduction in processing time|3x throughput increase|98% accuracy"
        order  = 2
    },
    @{
        title  = "Order-to-Cash Workflows"
        icon   = "ShoppingCart"
        industry = "Shared Services"
        desc   = "From order capture to cash reconciliation, fully executed. qubi orchestrates order validation, fulfillment triggers, invoicing, and payment matching across systems."
        outcomes = "Manual data entry eliminated|50% faster O2C cycle|99.2% accuracy"
        order  = 3
    },
    @{
        title  = "Financial Reconciliation"
        icon   = "DollarSign"
        industry = "Finance & Accounting"
        desc   = "Cross-system matching, exception handling, and reporting. Done. AI agents compare ledgers, flag discrepancies, and close the books without your team pulling all-nighters."
        outcomes = "Month-end close accelerated|Exceptions auto-resolved|Full audit trail"
        order  = 4
    },
    @{
        title  = "Customer Onboarding"
        icon   = "Users"
        industry = "Customer Operations"
        desc   = "Document collection, verification, and system setup, automated completely. New customers go from application to active in hours, not days."
        outcomes = "Onboarding time cut by 70%|Zero manual data entry|Compliance enforced automatically"
        order  = 5
    },
    @{
        title  = "Document-Heavy Decision Workflows"
        icon   = "FileText"
        industry = "Cross-Industry"
        desc   = "Complex multi-document processes with intelligent routing. Contracts, applications, reports - qubi reads them, extracts what matters, and routes to the right action."
        outcomes = "Any document type supported|AI extracts structured data|Decisions in minutes not days"
        order  = 6
    },
    @{
        title  = "Supply Chain Document Processing"
        icon   = "Truck"
        industry = "Supply Chain & Logistics"
        desc   = "Automate document processing and system updates across the supply chain. Bills of lading, shipping manifests, customs documents - processed and posted automatically."
        outcomes = "Processing time from days to hours|Zero manual keying|Real-time visibility"
        order  = 7
    },
    @{
        title  = "Prior Authorization Workflows"
        icon   = "FileText"
        industry = "Healthcare"
        desc   = "Automate prior authorization workflows end-to-end. Extract clinical data, validate against payer rules, submit and track - with AI handling the complexity."
        outcomes = "Auth turnaround from days to hours|Denial rates reduced|Clinical staff freed up"
        order  = 8
    }
)
foreach ($item in $useCaseItems) {
    Ensure-Content "use_case" $item.title @{
        type              = $item.icon
        external_link     = $item.industry
        description       = $item.desc
        description_short = $item.outcomes
        sort_order        = $item.order
    } | Out-Null
}

# ─── 5. EXECUTION ENGINE SECTION ────────────────────────────────────────────
Write-Host "`n[Use Cases Page - Execution Engine]" -ForegroundColor Magenta
$engine = Ensure-Section "uc_page_engine" @{
    section_title = "The Execution Engine"
    sort_order    = 4
}
$engineSteps = @(
    @{ label = "Documents"; sub = "Ingest and understand any document type"; emoji = "D"; order = 1 },
    @{ label = "Decisions"; sub = "AI + rules + context make the call";       emoji = "B"; order = 2 },
    @{ label = "Actions";   sub = "Execute across your enterprise systems";   emoji = "A"; order = 3 },
    @{ label = "Outcomes";  sub = "Work completed, verified, delivered";      emoji = "O"; order = 4 }
)
foreach ($item in $engineSteps) {
    Ensure-Category $engine.id "engine_step" $item.label @{ description = $item.sub; sort_order = $item.order } | Out-Null
}

# ─── 6. CTA SECTION ─────────────────────────────────────────────────────────
Write-Host "`n[Use Cases Page - CTA]" -ForegroundColor Magenta
Ensure-Section "uc_page_cta" @{
    section_title = "Ready to run your process with qBotica?"
    description   = "Tell us your most critical workflow. We'll show you exactly how qubi executes it end-to-end."
    display_type  = "Book a Demo"
    external_link = "https://meetings.hubspot.com/maheshv"
    sort_order    = 5
} | Out-Null

Write-Host "`nUse Cases page seeded successfully!" -ForegroundColor Green
