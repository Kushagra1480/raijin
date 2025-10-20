# Raijin - Real Time Balloon and Precipitation Visualization

<div align="center">
  <img width="300" height="600" alt="image" src="https://github.com/user-attachments/assets/abca7963-b340-45c8-b165-d90a81a732f2" style="border-radius: 15px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" width="700" />
</div>

This tool is live visualization of two apis- the WindBorne System's treasure endpoint for their weather balloon locations and the RainViewer Weather Maps API for precipitation data. The project demonstrates spatial analysis, time-series visualization, and interactive data exploration. 
## Features:
- Spatial Analysis

  - Drop a pin anywhere to see which balloons have passed through that area
  - Shows both current balloons and where they've been in the last 24 hours
  - Calculates distances so you can see coverage gaps

- Weather Integration

  - Live precipitation data overlaid on the map
  - Different colors for light rain vs heavy storms
  - Makes it obvious when balloons are flying through active weather

- Performance Stuff

  - Balloons become simple dots when you zoom out (rendering 1000+ detailed markers gets slow)
  - Runs entirely in the browser using Cloudflare Workers to get around CORS
  - Manages 24 hours of flight data (24,000 positions total) for time-travel and analysis
    
## Why Precipitation Data?
I chose real-time precipitation data because it directly demonstrates WindBorne's core mission: monitoring active weather systems in remote regions where traditional weather stations don't exist. The visualization shows which balloons are currently collecting data near storms, highlighting coverage gaps and demonstrating the value of autonomous atmospheric sensing.

## Technical Stack
  - Frontend
    
    - React
    - Leaflet.js for mapping
    - Custom state management for time-series data
  
  - Infrastructure
  
    - Cloudflare Workers (CORS proxy)
    - GitHub Pages (static hosting)
    - Client-side only architecture
  
  - Data Sources
  
    - WindBorne Systems API (balloon positions)
    - RainViewer API (precipitation data)

## Development Notes
- Challenges Solved
    
    - CORS restrictions handled via Cloudflare Workers
    - Performance optimization for rendering 1000+ markers
    - Time-series data management for 24-hour historical tracking
    - Spatial queries for radius-based analysis

- Design Decisions

  - Zoom-based LOD (Level of Detail) for map markers
  - Client-side only to enable easy deployment and showcase
  - Focus on storytelling through data rather than feature bloat

## Acknowledgments
Built as part of WindBorne Systems' engineering challenge. Thanks to their team for creating a well-designed challenge that encourages creative problem-solving and real-world application development! :)
