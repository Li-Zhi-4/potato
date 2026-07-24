# potato

Welcome to the BOM Management project. The purpose of this project is to build a local BOM Management system from the tools that you already possess. Using a lightweight backend that can integrate with Excel, the purpose of this project is to separate Excel/spreadsheets from the database, enabling small companies to utilize their familiar tools while taking a step towards a more modern workflow.

## API Documentation

To be continued...

### /parts

This is the API documentation for parts.

#### POST /parts

- `part_no` - text, required, unique
- `description` - text
- `is_assembly` - boolean, required, checks if a part is an assembly or not
- `created_by` - current uid
- `updated_by` - current uid

Request body:

```JSON
{
    "part_no": "VAC-CHMB-001",
    "description": "Main process chamber assembly with 4-port flange configuration",
    "is_assembly": true,
    "created_by": "0",
    "updated_by": "0"
}
```

# Updating Frontend UI Context

Currently have the following features setup:

- auth and login/signup workflow
- ability to create parts, vendors, POs, and BOMs
- ability to edit said entities above
- ability to attach vendors and subparts to parts

Currently reworking base UI into new design. 

Notes for later: rework primitives from scratch. Much faster than fighting against ShadCn UI design system.