# Dynamic Navbar Setup Guide

## Overview
The navbar is now **100% dynamic** and controlled entirely from Strapi. **ALL** navbar items including Home, Customers, Pricing, Solutions, Resources, etc. are fetched from the database. No hardcoded values.

## How It Works

The navbar supports **two types of menu items**:

### 1. **Direct Links** (no dropdown)
- Section with a link but **no categories**
- Examples: Home, Customers, Pricing
- Set `internal_link` or `external_link` on the section itself

### 2. **Dropdown Menus** (with sub-items)
- Section with **categories** as sub-items
- Examples: Solutions, Resources
- Categories become the menu items in the dropdown

## Setup Instructions

### 1. Start Strapi Server
```bash
npm run dev
```

### 2. Create Navbar Sections in Strapi

Go to **http://localhost:1337/admin** → **Sections**

Create sections with:
- `show_in_nav`: **true** (IMPORTANT - this makes it appear in navbar)
- `published`: true
- `sort_order`: controls the order (1, 2, 3, etc.)

**Choose how you want to display each section:**

#### Option A: Direct Link (No Dropdown)
Set these fields on the **Section**:
- `section_title`: "Home", "Customers", "Pricing", etc.
- `internal_link`: for internal routes (e.g., `/`, `/customers`, `/pricing`)
- `external_link`: for external URLs (e.g., `https://example.com`)

**Do NOT add Categories** - this makes it a direct link.

#### Option B: Dropdown Menu
**Don't set links on the section itself.** Instead:
- `section_title`: "Solutions", "Resources", etc.
- Leave `internal_link` and `external_link` empty
- Add **Categories** to this section (see below)

### 3. Add Categories (for dropdown sections only)

Go to **Categories** and create categories for sections with dropdowns:
- `section_id`: the dropdown section ID
- `category_title`: the menu item label
- `internal_link` or `external_link`: the URL
- `published`: true
- `sort_order`: controls the order within the dropdown

## Example Structure

```
Sections (with show_in_nav=true):

1. Home (sort_order: 1)
   ├─ internal_link: /
   ├─ No categories (direct link)

2. Solutions (sort_order: 2)
   ├─ No link on section
   └─ Categories:
      ├─ Use Cases → /solutions/use-cases
      └─ Industries → /solutions/industries

3. Resources (sort_order: 3)
   ├─ No link on section
   └─ Categories:
      ├─ Blog → /resources/blog
      ├─ Product Demo → /resources/demo
      └─ FAQs → /resources/faqs

4. Customers (sort_order: 4)
   ├─ internal_link: /customers
   ├─ No categories (direct link)

5. Pricing (sort_order: 5)
   ├─ internal_link: /pricing
   ├─ No categories (direct link)
```

## Automatic Seeding (Optional)

Run the seed script to create example sections:
```bash
.\scripts\seed-navbar.ps1
```

This creates all examples above.

## Managing Navbar After Setup

### Add a New Direct Link
1. Go to Strapi Admin → Sections
2. Create a new section with:
   - `section_title`: "About", "Contact", etc.
   - `internal_link` or `external_link`: the URL
   - `show_in_nav`: **true**
   - `sort_order`: your desired position

### Add a New Dropdown Menu
1. Create a new section with:
   - `section_title`: "Products", "Services", etc.
   - **Leave links empty** on the section
   - `show_in_nav`: **true**
   - `sort_order`: your desired position
2. Add categories to this section

### Add a New Menu Item to a Dropdown
1. Go to Strapi Admin → Categories
2. Create a new category with:
   - `section_id`: the dropdown section ID
   - `category_title`: the menu item label
   - `internal_link` or `external_link`: the URL
   - `published`: true

### Remove a Menu Item
- Go to Strapi Admin → Sections or Categories
- Set `show_in_nav`: **false** (or `published`: false)

### Change Menu Order
- Update `sort_order` field on sections/categories
- Refresh the website

### Rename Menu Items
- Edit `section_title` or `category_title`
- Changes appear on refresh

## Field Reference

### Section Fields (for navbar)
| Field | Type | Purpose |
|-------|------|---------|
| `section_title` | string | Label shown in navbar |
| `show_in_nav` | boolean | **true** to display in navbar |
| `published` | boolean | true to make active |
| `sort_order` | number | Order in navbar (1, 2, 3...) |
| `internal_link` | string | For direct links like `/customers` |
| `external_link` | string | For external URLs like `https://...` |

### Category Fields (for dropdown items)
| Field | Type | Purpose |
|-------|------|---------|
| `category_title` | string | Menu item label |
| `section_id` | number | Which section this belongs to |
| `internal_link` | string | Route link |
| `external_link` | string | External URL |
| `published` | boolean | true to make active |
| `sort_order` | number | Order within dropdown (1, 2, 3...) |

## Testing Changes

1. Make a change in Strapi
2. Publish/Save the changes
3. Refresh the website (Ctrl+R)
4. The navbar updates automatically

## Troubleshooting

### Items not showing
- ✅ Check `show_in_nav = true`
- ✅ Check `published = true`
- ✅ Check `sort_order` is set
- ✅ Refresh the page (not just reload assets)

### Items in wrong order
- Update `sort_order` values
- Lower numbers appear first

### Direct link not working
- Verify `internal_link` or `external_link` is set
- Verify there are **no categories** for direct link sections

### Dropdown not showing
- Verify `show_in_nav = true` on section
- Verify categories are created with this section_id
- Verify categories have `published = true`

## 100% Dynamic = Complete Control

All navbar items are now controlled from Strapi:
- ✅ Change section/item names anytime
- ✅ Add new menu items instantly
- ✅ Remove items by setting `published = false`
- ✅ Convert between direct link ↔ dropdown
- ✅ Manage visibility with `show_in_nav`
- ✅ Control order with `sort_order`

All changes reflect on website refresh!


