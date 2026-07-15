# Seed Industries Page sections + categories into Strapi
# Run: powershell -ExecutionPolicy Bypass -File .\scripts\seed-industries-page.ps1

$TOKEN = "40696bf405e8923483f887176bce96bb24ee09a19010bfc83caff10a5621b565794780f1799447358ff961f466a207f9a98b8cd6dd1ac64ba9008cf31859023156191cc41a2fd623e2793a62d29a255e8cc9f052744fd1c07c362449b10f619769865126f6b1b627f81039e85c223837088ae2691ce5d11dc03fd1ec16b6c943"
$BASE  = "http://localhost:1337"
$H     = @{ Authorization = "Bearer $TOKEN"; "Content-Type" = "application/json" }

function Ensure-Section {
  param($type, [hashtable]$data)
  $url      = "$BASE/api/sections?filters[section_type][$eq]=$type&pagination[limit]=1"
  $existing = (Invoke-RestMethod $url -Headers $H).data
  if ($existing.Count -gt 0) {
    Write-Host "  [SKIP] section '$type' (id $($existing[0].id))"
    return $existing[0]
  }
  $body   = @{ data = $data } | ConvertTo-Json -Depth 6
  $result = Invoke-RestMethod "$BASE/api/sections" -Method POST -Headers $H -Body $body
  Write-Host "  [NEW ] section '$type' (id $($result.data.id))"
  return $result.data
}

function Ensure-Category {
  param($sectionId, $type, $title, [hashtable]$extra = @{})
  $esc      = [uri]::EscapeDataString($type)
  $url      = "$BASE/api/categories?filters[section_id][$eq]=$sectionId&filters[category_type][$eq]=$esc&filters[category_title][$eq]=$(([uri]::EscapeDataString($title)))&pagination[limit]=1"
  $existing = (Invoke-RestMethod $url -Headers $H).data
  if ($existing.Count -gt 0) {
    Write-Host "    [SKIP] category '$title'"
    return $existing[0]
  }
  $data   = @{ section_id = $sectionId; category_type = $type; category_title = $title; published = $true } + $extra
  $body   = @{ data = $data } | ConvertTo-Json -Depth 6
  $result = Invoke-RestMethod "$BASE/api/categories" -Method POST -Headers $H -Body $body
  Write-Host "    [NEW ] category '$title'"
  return $result.data
}

function Ensure-Content {
  param($categoryId, $contentType, $title, [hashtable]$extra = @{})
  $esc      = [uri]::EscapeDataString($contentType)
  $url      = "$BASE/api/contents?filters[category_id][$eq]=$categoryId&filters[content_type][$eq]=$esc&filters[title][$eq]=$(([uri]::EscapeDataString($title)))&pagination[limit]=1"
  $existing = (Invoke-RestMethod $url -Headers $H).data
  if ($existing.Count -gt 0) {
    Write-Host "      [SKIP] content '$title'"
    return $existing[0]
  }
  $data   = @{ category_id = $categoryId; content_type = $contentType; title = $title; published = $true } + $extra
  $body   = @{ data = $data } | ConvertTo-Json -Depth 6
  $result = Invoke-RestMethod "$BASE/api/contents" -Method POST -Headers $H -Body $body
  Write-Host "      [NEW ] content '$title'"
  return $result.data
}

# ═══════════════════════════════════════════════════════════════════════════════
# 1. HERO
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[1] Hero"
Ensure-Section "ind_page_hero" @{
  section_type  = "ind_page_hero"
  section_title = "Industries & Workflows We Run"
  template      = "Industry Solutions"
  description   = "From financial services to healthcare, we handle the complexity of real enterprise operations. End-to-end execution, as a managed service."
  display_type  = "Talk to an Industry Expert"
  external_link = "https://meetings.hubspot.com/maheshv"
  published     = $true
} | Out-Null

# ═══════════════════════════════════════════════════════════════════════════════
# 2. INDUSTRIES GRID (categories + workflow contents)
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[2] Industry grid section"
$grid = Ensure-Section "ind_page_grid" @{
  section_type  = "ind_page_grid"
  section_title = "Industries We Serve"
  published     = $true
}
$gridId = $grid.id

$industries = @(
  @{
    title       = "Financial Services"
    icon        = "Building2"
    description = "AI-driven execution for the workflows that power financial operations — from invoice reconciliation to compliance reporting."
    workflows   = @("Close the books faster with AI-driven reconciliation","Process invoices end-to-end without manual bottlenecks","Automate three-way matching and exception handling","Continuous invoice processing at scale")
  },
  @{
    title       = "Healthcare & Insurance"
    icon        = "HeartPulse"
    description = "Handle the complexity of healthcare workflows with AI agents that understand clinical data, payer rules, and compliance requirements."
    workflows   = @("Process claims end-to-end without human bottlenecks","Automate prior authorization workflows","AI-driven eligibility verification","Denial management and appeals automation")
  },
  @{
    title       = "Shared Services & Operations"
    icon        = "BarChart3"
    description = "Unify fragmented operations across shared service centers with AI orchestration that connects every system and every step."
    workflows   = @("Automate order-to-cash across systems","Extract, validate, and act on financial data in minutes","HR document processing and onboarding","Cross-system reconciliation and reporting")
  },
  @{
    title       = "Supply Chain & Logistics"
    icon        = "Truck"
    description = "Keep goods moving with AI that processes shipping documents, updates systems, and handles exceptions without human bottlenecks."
    workflows   = @("Automate document processing and system updates","Reduce processing time from days to hours","Bills of lading and customs document automation","Freight invoice processing and matching")
  },
  @{
    title       = "Accounts Payable & Procurement"
    icon        = "CreditCard"
    description = "Transform AP from a cost center into a strategic advantage with AI execution that handles the entire invoice lifecycle."
    workflows   = @("Three-way matching and exception handling","Continuous invoice processing at scale","Vendor onboarding and compliance checks","Early payment discount capture")
  },
  @{
    title       = "Customer Operations"
    icon        = "Headphones"
    description = "Deliver better customer experiences by automating the back-office work that backs every customer interaction."
    workflows   = @("Automate customer onboarding workflows","Reduce manual data entry and system updates","Contract processing and activation","Customer document verification at scale")
  }
)

$order = 1
foreach ($ind in $industries) {
  Write-Host "  Industry: $($ind.title)"
  $cat = Ensure-Category $gridId "industry" $ind.title @{
    description_short = $ind.icon
    description       = $ind.description
    sort_order        = $order
  }
  $catId = $cat.id
  $wOrder = 1
  foreach ($wf in $ind.workflows) {
    Ensure-Content $catId "industry_workflow" $wf @{ sort_order = $wOrder } | Out-Null
    $wOrder++
  }
  $order++
}

# ═══════════════════════════════════════════════════════════════════════════════
# 3. WHAT QBOTICA ACTUALLY DOES
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[3] What qBotica actually does"
$what = Ensure-Section "ind_page_what" @{
  section_type  = "ind_page_what"
  section_title = "What qBotica actually does"
  template      = "Plain English"
  description   = "No jargon. Here's what happens when qBotica runs your work."
  display_type  = "We don't automate tasks. We execute outcomes."
  published     = $true
}
$whatId = $what.id

Write-Host "  Verbs"
$verbs = @(
  @{ title = "Reads";        detail = "documents including invoices, claims, contracts, and financials" },
  @{ title = "Decides";      detail = "using AI, rules, and context — not just pattern matching" },
  @{ title = "Executes";     detail = "actions across systems like ERP, CRM, and beyond" },
  @{ title = "Orchestrates"; detail = "workflows end-to-end, not just individual steps" },
  @{ title = "Runs";         detail = "operations continuously, 24/7 with no human bottleneck" }
)
$i = 1
foreach ($v in $verbs) {
  Ensure-Category $whatId "what_verb" $v.title @{ description = $v.detail; sort_order = $i } | Out-Null
  $i++
}

Write-Host "  Capability cards"
$cards = @(
  @{ title = "Documents"; emoji = "📄"; desc = "Ingest and understand any document type — invoices, claims, contracts, financials" },
  @{ title = "Decisions";  emoji = "🧠"; desc = "AI + rules + context make the call. Not just pattern matching." },
  @{ title = "Actions";    emoji = "⚡"; desc = "Execute across your enterprise systems. ERP, CRM, and beyond." },
  @{ title = "Outcomes";   emoji = "✅"; desc = "Work completed, verified, delivered. Continuously." }
)
$i = 1
foreach ($c in $cards) {
  Ensure-Category $whatId "what_card" $c.title @{ description_short = $c.emoji; description = $c.desc; sort_order = $i } | Out-Null
  $i++
}

# ═══════════════════════════════════════════════════════════════════════════════
# 4. COMPARISON — MOST AI STOPS HERE
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[4] Comparison"
$comp = Ensure-Section "ind_page_comparison" @{
  section_type  = "ind_page_comparison"
  section_title = "Most AI stops here. We don't."
  published     = $true
}
$compId = $comp.id

$others  = @("Analyze data","Assist users","Require teams to execute","Sit outside workflows")
$qbotica = @("Executes work","Completes processes","Owns outcomes","Operates inside systems")

$i = 1
foreach ($o in $others)  { Ensure-Category $compId "others_item"  $o @{ sort_order = $i } | Out-Null; $i++ }
$i = 1
foreach ($q in $qbotica) { Ensure-Category $compId "qbotica_item" $q @{ sort_order = $i } | Out-Null; $i++ }

# ═══════════════════════════════════════════════════════════════════════════════
# 5. WHY ENTERPRISE AI FAILS
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[5] Why Enterprise AI Fails"
$prob = Ensure-Section "ind_page_problems" @{
  section_type  = "ind_page_problems"
  section_title = "Why Enterprise AI Fails"
  template      = "The Problem"
  description   = "Most AI solutions stop short of real execution. They analyze, they assist, but they don't complete the work."
  published     = $true
}
$probId = $prob.id

$problems = @(
  @{ title = "Analyzes but doesn't act";       desc = "Most AI solutions generate insights but never execute. They sit in dashboards while your team manually implements decisions." },
  @{ title = "Assists but doesn't complete";   desc = "Copilots help, but they don't finish the job. You still need humans to validate, correct, and push data through systems." },
  @{ title = "Sits outside operations";        desc = "Disconnected from your systems. Disconnected from your workflows. Disconnected from where work actually happens." }
)
$i = 1
foreach ($p in $problems) {
  Ensure-Category $probId "problem_card" $p.title @{ description = $p.desc; sort_order = $i } | Out-Null
  $i++
}

# ═══════════════════════════════════════════════════════════════════════════════
# 6. CTA
# ═══════════════════════════════════════════════════════════════════════════════
Write-Host "`n[6] CTA"
Ensure-Section "ind_page_cta" @{
  section_type  = "ind_page_cta"
  section_title = "Don't see your industry? Let's talk."
  description   = "We work across any industry where documents, decisions, and system actions need to happen together. Tell us your workflow."
  display_type  = "Book a Demo"
  external_link = "https://meetings.hubspot.com/maheshv"
  published     = $true
} | Out-Null

Write-Host "`n✅  Industries page seed complete!"
