const PREVIEW_HEADER = 'X-XLab-Preview-Secret';

export async function onRequest(context) {
  // The production branch contains only public site content. Every non-main
  // branch is a draft preview and must fail closed.
  if (context.env.CF_PAGES_BRANCH === 'main') return context.next();

  const expected = context.env.PREVIEW_SHARED_SECRET || '';
  const supplied = context.request.headers.get(PREVIEW_HEADER) || '';
  if (!expected || !constantTimeEqual(expected, supplied)) {
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function constantTimeEqual(expected, supplied) {
  if (expected.length !== supplied.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  }
  return difference === 0;
}
