# Seed script for Navbar menu items in Strapi
# This script creates example navbar sections and categories
# All navbar content is now fully dynamic and controlled from Strapi
# Simply set show_in_nav = true for any section to display it in the navbar

$STRAPI_URL = "http://localhost:1337"

# Helper function to make API requests
function Invoke-StrapiApi {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [object]$Body = $null
    )
    
    $headers = @{"Content-Type" = "application/json"}
    $params = @{
        Uri = "$STRAPI_URL$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params.Body = $Body | ConvertTo-Json -Depth 10
    }
    
    return Invoke-RestMethod @params
}

Write-Host "=== Full Navbar Dynamic Seeding ===" -ForegroundColor Green
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Create Sections in Strapi with show_in_nav = true"
Write-Host "2. Add Categories to dropdown sections"
Write-Host "3. Or set internal_link on section for direct links"
Write-Host "4. The navbar will automatically display all sections with show_in_nav = true"
Write-Host ""

# Example 1: Home (direct link - no categories needed)
Write-Host "Creating 'Home' section (direct link)..."
$homeSection = @{
    section_title = "Home"
    internal_link = "/"
    sort_order = 1
    published = $true
    show_in_nav = $true
}

try {
    $sectionResponse = Invoke-StrapiApi -Endpoint "/api/sections" -Method "POST" -Body $homeSection
    Write-Host "✓ Home section created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Home section already exists or error occurred" -ForegroundColor Yellow
}

# Example 2: Solutions (with dropdown categories)
Write-Host ""
Write-Host "Creating 'Solutions' section (with dropdown)..."
$solutionsSection = @{
    section_title = "Solutions"
    sort_order = 2
    published = $true
    show_in_nav = $true
}

try {
    $sectionResponse = Invoke-StrapiApi -Endpoint "/api/sections" -Method "POST" -Body $solutionsSection
    $solutionsId = $sectionResponse.data.id
    Write-Host "✓ Solutions section created with ID: $solutionsId" -ForegroundColor Green
    
    # Add categories to Solutions section
    $solutionItems = @(
        @{
            category_title = "Use Cases"
            internal_link = "/solutions/use-cases"
            section_id = $solutionsId
            sort_order = 1
            published = $true
        },
        @{
            category_title = "Industries"
            internal_link = "/solutions/industries"
            section_id = $solutionsId
            sort_order = 2
            published = $true
        }
    )
    
    foreach ($item in $solutionItems) {
        Invoke-StrapiApi -Endpoint "/api/categories" -Method "POST" -Body $item | Out-Null
        Write-Host "  ✓ Added: $($item.category_title)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Solutions section already exists or error occurred" -ForegroundColor Yellow
}

# Example 3: Resources (with dropdown categories)
Write-Host ""
Write-Host "Creating 'Resources' section (with dropdown)..."
$resourcesSection = @{
    section_title = "Resources"
    sort_order = 3
    published = $true
    show_in_nav = $true
}

try {
    $sectionResponse = Invoke-StrapiApi -Endpoint "/api/sections" -Method "POST" -Body $resourcesSection
    $resourcesId = $sectionResponse.data.id
    Write-Host "✓ Resources section created with ID: $resourcesId" -ForegroundColor Green
    
    # Add categories to Resources section
    $resourcesItems = @(
        @{
            category_title = "Blog"
            internal_link = "/resources/blog"
            section_id = $resourcesId
            sort_order = 1
            published = $true
        },
        @{
            category_title = "Product Demo"
            internal_link = "/resources/demo"
            section_id = $resourcesId
            sort_order = 2
            published = $true
        },
        @{
            category_title = "FAQs"
            internal_link = "/resources/faqs"
            section_id = $resourcesId
            sort_order = 3
            published = $true
        }
    )
    
    foreach ($item in $resourcesItems) {
        Invoke-StrapiApi -Endpoint "/api/categories" -Method "POST" -Body $item | Out-Null
        Write-Host "  ✓ Added: $($item.category_title)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Resources section already exists or error occurred" -ForegroundColor Yellow
}

# Example 4: Customers (direct link)
Write-Host ""
Write-Host "Creating 'Customers' section (direct link)..."
$customersSection = @{
    section_title = "Customers"
    internal_link = "/customers"
    sort_order = 4
    published = $true
    show_in_nav = $true
}

try {
    Invoke-StrapiApi -Endpoint "/api/sections" -Method "POST" -Body $customersSection | Out-Null
    Write-Host "✓ Customers section created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Customers section already exists or error occurred" -ForegroundColor Yellow
}

# Example 5: Pricing (direct link)
Write-Host ""
Write-Host "Creating 'Pricing' section (direct link)..."
$pricingSection = @{
    section_title = "Pricing"
    internal_link = "/pricing"
    sort_order = 5
    published = $true
    show_in_nav = $true
}

try {
    Invoke-StrapiApi -Endpoint "/api/sections" -Method "POST" -Body $pricingSection | Out-Null
    Write-Host "✓ Pricing section created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Pricing section already exists or error occurred" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "How to manage navbar:" -ForegroundColor Cyan
Write-Host "  • Go to Strapi Admin Panel"
Write-Host "  • Create Sections with show_in_nav=true"
Write-Host "  • For direct links: set internal_link/external_link on the section"
Write-Host "  • For dropdowns: don't set link, just add Categories"
Write-Host "  • Sort items using sort_order field"
Write-Host "  • Changes appear automatically on website refresh"
Write-Host ""
Write-Host "All navbar content is now 100% controlled from Strapi!" -ForegroundColor Yellow



