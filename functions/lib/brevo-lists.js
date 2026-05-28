const NEWSLETTER_LIST_NAMES = ['_newsletter', 'newsletter', 'Newsletter'];

function brevoHeaders(apiKey) {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    'api-key': apiKey,
  };
}

function parseListId(value) {
  const id = parseInt(String(value || '').trim(), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function matchNewsletterList(lists) {
  const normalized = new Set(NEWSLETTER_LIST_NAMES.map((n) => n.toLowerCase()));
  for (const list of lists || []) {
    const name = String(list.name || '').trim();
    if (normalized.has(name.toLowerCase())) return list.id;
  }
  for (const list of lists || []) {
    const name = String(list.name || '').trim().toLowerCase();
    if (name.includes('newsletter')) return list.id;
  }
  return null;
}

async function fetchLists(apiKey) {
  const res = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50&offset=0', {
    headers: brevoHeaders(apiKey),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    return { ok: false, status: res.status, data, lists: [] };
  }
  return { ok: true, status: res.status, data, lists: data.lists || [] };
}

async function fetchFolders(apiKey) {
  const res = await fetch('https://api.brevo.com/v3/contacts/folders?limit=50', {
    headers: brevoHeaders(apiKey),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    return { ok: false, status: res.status, data, folders: [] };
  }
  const folders = data.folders || data.items || [];
  return { ok: true, folders: Array.isArray(folders) ? folders : [] };
}

async function folderIdFromKnownList(apiKey) {
  for (const listId of [26, 27, 28]) {
    const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}`, {
      headers: brevoHeaders(apiKey),
    });
    if (!res.ok) continue;
    const text = await res.text();
    try {
      const data = text ? JSON.parse(text) : {};
      const folderId = data.folderId ?? data.folder_id;
      if (folderId) return folderId;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function resolveFolderId(apiKey) {
  const fromKnown = await folderIdFromKnownList(apiKey);
  if (fromKnown) return fromKnown;

  const fromLists = await fetchLists(apiKey);
  if (fromLists.ok) {
    for (const list of fromLists.lists) {
      const folderId = list.folderId ?? list.folder_id;
      if (folderId) return folderId;
    }
  }

  const foldersResult = await fetchFolders(apiKey);
  if (foldersResult.ok && foldersResult.folders.length) {
    return foldersResult.folders[0].id;
  }

  const res = await fetch('https://api.brevo.com/v3/contacts/folders', {
    method: 'POST',
    headers: brevoHeaders(apiKey),
    body: JSON.stringify({ name: 'WIN' }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (res.ok && data.id) return data.id;
  return null;
}

async function createNewsletterList(apiKey) {
  const folderId = await resolveFolderId(apiKey);
  if (!folderId) {
    return {
      ok: false,
      status: 400,
      data: { message: 'Unable to resolve a Brevo folder for the newsletter list.' },
    };
  }

  const res = await fetch('https://api.brevo.com/v3/contacts/lists', {
    method: 'POST',
    headers: brevoHeaders(apiKey),
    body: JSON.stringify({ name: '_newsletter', folderId }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  const id = data.id ?? data?.list?.id;
  if (res.ok && id) {
    return { ok: true, id };
  }
  return { ok: false, status: res.status, data };
}

/**
 * Resolve Brevo list ID for the footer newsletter form.
 * Uses BREVO_LIST_NEWSLETTER when set; otherwise finds or creates "_newsletter".
 */
export async function resolveNewsletterListId(apiKey, env) {
  const configured = parseListId(env?.BREVO_LIST_NEWSLETTER);
  if (configured) return { ok: true, id: configured, source: 'env' };

  const listsResult = await fetchLists(apiKey);
  if (!listsResult.ok) {
    return {
      ok: false,
      message:
        listsResult.data?.message ||
        'Unable to load Brevo contact lists. Check your API key and authorised IPs.',
      status: listsResult.status,
    };
  }

  const existing = matchNewsletterList(listsResult.lists);
  if (existing) {
    return { ok: true, id: existing, source: 'brevo' };
  }

  const created = await createNewsletterList(apiKey);
  if (created.ok) {
    return { ok: true, id: created.id, source: 'created' };
  }

  return {
    ok: false,
    message:
      created.data?.message ||
      'Newsletter list not found in Brevo. Create a list named "_newsletter" or set BREVO_LIST_NEWSLETTER.',
    status: created.status,
  };
}
