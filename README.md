# potato

Welcome to the potato project.

## API Documentation

For localhost settings, use the following as the base url:

```
http://127.0.0.1:5000/
```

### /parts

This is the API documentation for parts.

#### POST /parts

- `part_no` - text, required, unique
- `description` - text
- `is_assembly` - boolean, required, checks if a part is an assembly or not
- `workflow_id` - text
- `created_by` - current uid
- `updated_by` - current uid

Request body:

```JSON
{
    "part_no": "VAC-CHMB-001",
    "description": "Main process chamber assembly with 4-port flange configuration",
    "is_assembly": true,
    "workflow_id": "WF-PROD-2026",
    "created_by": "0",
    "updated_by": "0"
}
```
