export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''

  if (!query || query.length < 3) {
    return Response.json({ results: [] })
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'achievers-prototype/1.0 (student project)',
        'Accept-Language': 'en'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return Response.json({ results: [], error: 'Upstream geocoder error' }, { status: response.status })
    }

    const data = await response.json()
    const results = Array.isArray(data)
      ? data.map(item => ({
          name: item.display_name.split(',')[0],
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          fullName: item.display_name
        }))
      : []

    return Response.json({ results })
  } catch (err) {
    return Response.json({ results: [], error: 'Geocoding failed' }, { status: 500 })
  }
}
