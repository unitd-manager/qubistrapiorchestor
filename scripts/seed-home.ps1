#!/usr/bin/env pwsh
# seed-home.ps1 — Seeds all home-page sections + items into Strapi

param(
    [string]$StrapiUrl = "http://localhost:1337",
    [string]$ApiToken = "40696bf405e8923483f887176bce96bb24ee09a19010bfc83caff10a5621b565794780f1799447358ff961f466a207f9a98b8cd6dd1ac64ba9008cf31859023156191cc41a2fd623e2793a62d29a255e8cc9f052744fd1c07c362449b10f619769865126f6b1b627f81039e85c223837088ae2691ce5d11dc03fd1ec16b6c943"
)

Set-StrictMode -Off
$ErrorActionPreference = "Stop"

Write-Host "Using API Token for content API..." -ForegroundColor Cyan
$H = @{ Authorization = "Bearer $ApiToken"; "Content-Type" = "application/json" }
Write-Host "Ready." -ForegroundColor Green

# ─── Helpers ────────────────────────────────────────────────────────────────
function Post-Section($data) {
    $body = @{ data = $data } | ConvertTo-Json -Depth 5
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/sections" -Method POST -Headers $H -Body $body
    return $resp.data
}

function Post-Category($data) {
    $body = @{ data = $data } | ConvertTo-Json -Depth 5
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/categories" -Method POST -Headers $H -Body $body
    return $resp.data
}

function Get-SectionByType($sectionType) {
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/sections?filters[section_type][$eq]=$sectionType&pagination[pageSize]=1" -Headers $H
    if ($resp.data.Count -gt 0) { return $resp.data[0] }
    return $null
}

function Get-CategoriesBySectionId($sectionId) {
    $resp = Invoke-RestMethod -Uri "$StrapiUrl/api/categories?filters[section_id][$eq]=$sectionId&pagination[pageSize]=50" -Headers $H
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
    $created = Post-Section $fields
    Write-Host "  Created section '$sectionType' (id=$($created.id))" -ForegroundColor Green
    return $created
}

function Ensure-Category($sectionId, $categoryType, $categoryTitle, $extraFields) {
    $existing = Get-CategoriesBySectionId $sectionId | Where-Object { $_.category_type -eq $categoryType -and $_.category_title -eq $categoryTitle }
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
    $created = Post-Category $data
    Write-Host "    Created category '$categoryTitle'" -ForegroundColor Green
    return $created
}

# ─── 1. HERO ────────────────────────────────────────────────────────────────
Write-Host "`n[Hero]" -ForegroundColor Magenta
$hero = Ensure-Section "hero" @{
    section_title = "Orchestrate AI Agents, Bots, Systems & People with qubi"
    description   = "A unified platform for designing, deploying, and managing intelligent workflows powered by AI agents, automation, human input, and enterprise integrations."
    template      = "Agentic Automation Platform"
    external_link = "https://meetings.hubspot.com/maheshv"
    display_type  = "Book a Demo"
    sort_order    = 1
}

# ─── 2. PROBLEM ─────────────────────────────────────────────────────────────
Write-Host "`n[Problem]" -ForegroundColor Magenta
$problem = Ensure-Section "problem" @{
    section_title = "Enterprise work is too fragmented to automate with bots alone"
    description   = "Most enterprises struggle with siloed tools, manual processes, and limited scalability - making true end-to-end automation impossible."
    sort_order    = 2
}
$problemItems = @(
    @{ title = "Disconnected systems"; icon = "Unlink";        order = 1 },
    @{ title = "Manual handoffs";       icon = "HandMetal";     order = 2 },
    @{ title = "Exception-heavy workflows"; icon = "AlertTriangle"; order = 3 },
    @{ title = "Limited visibility";    icon = "Eye";           order = 4 },
    @{ title = "Difficulty scaling automation"; icon = "Scaling"; order = 5 }
)
foreach ($item in $problemItems) {
    Ensure-Category $problem.id "problem_item" $item.title @{ description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 3. CAPABILITIES ────────────────────────────────────────────────────────
Write-Host "`n[Capabilities]" -ForegroundColor Magenta
$capabilities = Ensure-Section "capabilities" @{
    section_title = "One platform. Modular capabilities. Enterprise control."
    template      = "What qubi is"
    sort_order    = 3
}
$capItems = @(
    @{ title = "Design";          desc = "Build automations and AI-powered workflows with low-code tools.";                                   icon = "Paintbrush"; order = 1 },
    @{ title = "Orchestrate";     desc = "Coordinate bots, agents, systems, and workloads from one control layer.";                          icon = "Layers";     order = 2 },
    @{ title = "Integrate";       desc = "Connect enterprise systems, apps, data, and AI services seamlessly.";                              icon = "Plug";       order = 3 },
    @{ title = "Collaborate";     desc = "Bring humans into the loop when judgment or approvals are required.";                              icon = "Users";      order = 4 },
    @{ title = "Optimize";        desc = "Measure performance, ROI, and operational impact in real time.";                                   icon = "BarChart3";  order = 5 },
    @{ title = "Support & Govern"; desc = "Manage access, support issues, and enterprise reliability at scale.";                            icon = "ShieldCheck"; order = 6 }
)
foreach ($item in $capItems) {
    Ensure-Category $capabilities.id "capability_item" $item.title @{ description = $item.desc; description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 4. OUTCOMES ────────────────────────────────────────────────────────────
Write-Host "`n[Outcomes]" -ForegroundColor Magenta
$outcomes = Ensure-Section "outcomes" @{
    section_title = "Built for measurable operational impact"
    template      = "Platform outcomes"
    sort_order    = 4
}
$outcomeItems = @(
    @{ title = "Faster cycle times";      desc = "Accelerate end-to-end process completion";                   icon = "Zap";        order = 1 },
    @{ title = "Lower operating cost";    desc = "Reduce manual effort and rework";                            icon = "DollarSign"; order = 2 },
    @{ title = "Better productivity";     desc = "Free teams for higher-value work";                           icon = "TrendingUp"; order = 3 },
    @{ title = "More resilient operations"; desc = "Handle exceptions gracefully at scale";                   icon = "Shield";     order = 4 },
    @{ title = "Better visibility into ROI"; desc = "Track measurable outcomes in real time";                 icon = "Eye";        order = 5 },
    @{ title = "Stronger governance";     desc = "Centralized access and compliance control";                  icon = "Lock";       order = 6 }
)
foreach ($item in $outcomeItems) {
    Ensure-Category $outcomes.id "outcome_item" $item.title @{ description = $item.desc; description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 5. HOW IT WORKS ────────────────────────────────────────────────────────
Write-Host "`n[How It Works]" -ForegroundColor Magenta
$howItWorks = Ensure-Section "how-it-works" @{
    section_title = "From discovery to scale in four steps"
    template      = "How it works"
    sort_order    = 5
}
$stepItems = @(
    @{ title = "Identify"; desc = "Discover high-value automation opportunities across your organization.";                               icon = "Search";    step = "01"; order = 1 },
    @{ title = "Design";   desc = "Build workflows and agent experiences with low-code tools and AI assistance.";                        icon = "PenTool";   step = "02"; order = 2 },
    @{ title = "Deploy";   desc = "Roll out automations across systems and teams with enterprise-grade reliability.";                    icon = "Rocket";    step = "03"; order = 3 },
    @{ title = "Optimize"; desc = "Monitor, measure, and continuously scale for maximum operational impact.";                            icon = "LineChart";  step = "04"; order = 4 }
)
foreach ($item in $stepItems) {
    Ensure-Category $howItWorks.id "step" $item.title @{ description = $item.desc; description_short = $item.step; external_link = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 6. USE CASES ───────────────────────────────────────────────────────────
Write-Host "`n[Use Cases]" -ForegroundColor Magenta
$useCases = Ensure-Section "use-cases" @{
    section_title = "Automation that fits your business"
    template      = "Use cases"
    sort_order    = 6
}
$ucItems = @(
    @{ title = "Customer Service & Support";    desc = "Automate ticket routing, resolution, and follow-ups with AI agents and human escalation."; icon = "Headphones"; order = 1 },
    @{ title = "Finance & Back Office";         desc = "Streamline invoicing, reconciliation, and compliance workflows across systems.";           icon = "Calculator"; order = 2 },
    @{ title = "IT Operations";                 desc = "Orchestrate monitoring, incident response, and infrastructure management.";                icon = "Monitor";    order = 3 },
    @{ title = "Document-Heavy Workflows";      desc = "Extract, validate, and process documents with intelligent automation.";                    icon = "FileText";   order = 4 },
    @{ title = "Employee Operations";           desc = "Automate onboarding, HR requests, and internal service delivery.";                        icon = "UserCog";    order = 5 },
    @{ title = "Cross-System Orchestration";    desc = "Connect and coordinate processes spanning multiple enterprise platforms.";                 icon = "GitBranch";  order = 6 }
)
foreach ($item in $ucItems) {
    Ensure-Category $useCases.id "use_case_item" $item.title @{ description = $item.desc; description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 7. INTEGRATIONS ────────────────────────────────────────────────────────
Write-Host "`n[Integrations]" -ForegroundColor Magenta
$integrations = Ensure-Section "integrations" @{
    section_title = "Works across your existing stack"
    description   = "Connect to the systems you already use - from enterprise ERPs to modern AI APIs - with pre-built connectors and extensible integration layers."
    template      = "Integrations"
    sort_order    = 7
}
$intItems = @(
    @{ label = "Enterprise Apps";    count = "500+"; icon = "Building2"; order = 1 },
    @{ label = "Databases";          count = "50+";  icon = "Database";  order = 2 },
    @{ label = "APIs";               count = "200+"; icon = "Globe";     order = 3 },
    @{ label = "AI Services / LLMs"; count = "20+";  icon = "Brain";     order = 4 },
    @{ label = "Third-Party Tools";  count = "300+"; icon = "Wrench";    order = 5 }
)
foreach ($item in $intItems) {
    Ensure-Category $integrations.id "integration_item" $item.label @{ description = $item.count; description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 8. HUMAN-IN-THE-LOOP ───────────────────────────────────────────────────
Write-Host "`n[Human-in-the-Loop]" -ForegroundColor Magenta
$hil = Ensure-Section "human-in-loop" @{
    section_title = "Automation where it makes sense. Human judgment where it matters."
    description   = "qubi seamlessly routes tasks between AI agents and human operators. When a workflow requires approval, exception handling, or expert judgment, the right person is brought into the loop - with full context and zero friction."
    template      = "Human-in-the-Loop"
    external_link = "https://meetings.hubspot.com/maheshv"
    display_type  = "Learn More"
    sort_order    = 8
}
$hilBadges = @("Attended automation", "Smart routing", "Approval workflows")
$badgeOrder = 1
foreach ($badge in $hilBadges) {
    Ensure-Category $hil.id "hil_badge" $badge @{ sort_order = $badgeOrder } | Out-Null
    $badgeOrder++
}

# ─── 9. ANALYTICS ───────────────────────────────────────────────────────────
Write-Host "`n[Analytics]" -ForegroundColor Magenta
$analytics = Ensure-Section "analytics" @{
    section_title = "Visibility, performance, and accountability built in"
    template      = "Analytics and Trust"
    sort_order    = 9
}
$analyticsItems = @(
    @{ title = "ROI tracking";             desc = "Quantify the value of every automated workflow.";      icon = "BarChart3";  order = 1 },
    @{ title = "Pipeline visibility";      desc = "See all running automations in real time.";            icon = "Activity";   order = 2 },
    @{ title = "Automation performance";   desc = "Track success rates, latency, and throughput.";       icon = "Gauge";      order = 3 },
    @{ title = "Workload monitoring";      desc = "Balance agent capacity and system load.";              icon = "Monitor";    order = 4 },
    @{ title = "Support management";       desc = "Manage support tickets and SLA compliance.";           icon = "Headphones"; order = 5 },
    @{ title = "Centralized access control"; desc = "Role-based governance across the platform.";         icon = "Lock";       order = 6 }
)
foreach ($item in $analyticsItems) {
    Ensure-Category $analytics.id "analytics_feature" $item.title @{ description = $item.desc; description_short = $item.icon; sort_order = $item.order } | Out-Null
}

# ─── 10. FINAL CTA ──────────────────────────────────────────────────────────
Write-Host "`n[Final CTA]" -ForegroundColor Magenta
$finalCta = Ensure-Section "final-cta" @{
    section_title = "See what qubi can automate in your enterprise"
    description   = "Ready to move from fragmented processes to intelligent, orchestrated workflows? Let's talk."
    external_link = "https://meetings.hubspot.com/maheshv"
    display_type  = "Book a Demo"
    template      = "Talk to an Expert"
    sort_order    = 10
}

# ─── 11. FOOTER ─────────────────────────────────────────────────────────────
Write-Host "`n[Footer]" -ForegroundColor Magenta
$footer = Ensure-Section "footer" @{
    section_title = "qubi by Qbotica"
    description   = "All rights reserved."
    sort_order    = 11
}
$footerLinks = @(
    @{ label = "Privacy"; url = "/privacy"; order = 1 },
    @{ label = "Terms";   url = "/terms";   order = 2 },
    @{ label = "Contact"; url = "/contact"; order = 3 }
)
foreach ($link in $footerLinks) {
    Ensure-Category $footer.id "footer_link" $link.label @{ external_link = $link.url; sort_order = $link.order } | Out-Null
}

Write-Host "`nAll sections seeded successfully!" -ForegroundColor Green
