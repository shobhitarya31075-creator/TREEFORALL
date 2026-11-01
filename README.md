# TreeForAll — Phase 6: Django REST API Integration

Phase 6 replaces the Phase 5 Flask server with a Django REST Framework-powered JSON API while preserving the existing accessible frontend, SVG visualizer, operation animations, history, speech tools, and learning videos.

## Project structure

```text
TreeForAll_Phase6/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── tree_engine.py
│   ├── config/          # Django settings, URL routing, WSGI
│   └── treeapi/         # JSON API views and routes
└── frontend/
    ├── index.html
    ├── css/style.css
    └── js/              # visualization, accessibility, speech, Phase 5 timeline
```

## Run on Windows (VS Code)

1. Extract the ZIP.
2. In VS Code choose **File → Open Folder** and open the extracted `TreeForAll_Phase6` folder (the folder containing `backend` and `frontend`).
3. Open **Terminal → New Terminal**. Make sure the prompt is at the project root, not inside `backend` or `frontend`.
4. Optional but recommended: create a virtual environment:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

5. Install Django and Django REST Framework:

   ```powershell
   py -m pip install -r backend/requirements.txt
   ```

6. Start Django:

   ```powershell
   py backend/manage.py runserver 127.0.0.1:8000
   ```

7. Open **http://127.0.0.1:8000** in your browser. Do not open `index.html` directly or use Live Server.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tree` | Current tree snapshot, stats and traversals |
| POST | `/api/insert` | Insert `{ "value": 42 }` |
| POST | `/api/delete` | Delete `{ "value": 42 }` |
| POST | `/api/search` | Search `{ "value": 42 }` |
| POST | `/api/reset` | Reset the in-memory tree |

All API responses are JSON. Insert/delete responses include engine-recorded animation events, so the Phase 5 timeline continues to replay actual intermediate snapshots.

## Verify the integration

- Open the site and check that the status changes to **Backend connected**.
- Insert `20`, `10`, and `30`.
- Search for `10`, then delete `20`.
- Use the Phase 5 Previous / Play / Next / Restart controls to inspect engine events.
- Try an invalid input (for example, `3.5`) to confirm the API returns a validation error.
- Use Reset to clear the tree.

## Notes and limitations

- The API uses Django REST Framework (`@api_view` and JSON `Response`) with explicit URL routing. It is intentionally lightweight and does not need database models for this single-user in-memory tree demo.
- Tree state is held in memory and resets when the Django server restarts. It is intended for a single-user local demonstration, not concurrent multi-user hosting.
- The demo API has open permissions and no authentication because it is designed for local single-user use. Add proper authentication, CSRF handling, production settings, and a production WSGI server before public deployment.
- Set `DEBUG = False`, configure a strong secret key and allowed hosts, and serve static assets through a production web server before deployment.
- The two existing YouTube lessons and all Phase 5 accessibility/animation features are preserved.
