import React, { useState, useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import AudioService from '../../services/AudioService';
import { translations } from '../../data/translations';
import { 
  Search, 
  RotateCcw, 
  Sliders, 
  X, 
  ExternalLink, 
  MessageSquare, 
  Calendar, 
  Hash, 
  BookOpen,
  Filter,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

const normalizeHeadingText = (value) =>
  String(value || '')
    .replace(/^#+\s+/, '')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const headingsMatch = (left, right) => {
  const a = normalizeHeadingText(left);
  const b = normalizeHeadingText(right);
  if (!a || !b) return false;

  const minLen = Math.min(a.length, b.length, 48);
  return a.slice(0, minLen) === b.slice(0, minLen);
};

const collapseBlankLines = (content) =>
  String(content || '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const stripLeadingPlainTitleRepeat = (content, title) => {
  const lines = String(content || '').split(/\r?\n/);
  let start = 0;

  while (start < lines.length && !lines[start].trim()) start += 1;
  if (start >= lines.length) return collapseBlankLines(content);

  const first = lines[start].trim();

  if (/^#{1,6}\s+/.test(first)) {
    const headingText = first.replace(/^#{1,6}\s+/, '').trim();
    let next = start + 1;

    while (next < lines.length && !lines[next].trim()) next += 1;
    if (next >= lines.length) return collapseBlankLines(content);

    const candidate = lines[next].trim();
    if (
      /^#{1,6}\s+/.test(candidate) ||
      (!headingsMatch(candidate, headingText) && !headingsMatch(candidate, title))
    ) {
      return collapseBlankLines(content);
    }

    lines.splice(next, 1);
    return collapseBlankLines(lines.join('\n'));
  }

  if (!headingsMatch(first, title)) return collapseBlankLines(content);

  lines.splice(start, 1);
  return collapseBlankLines(lines.join('\n'));
};

const stripHeadingMatchingTitle = (content, title) => {
  let body = String(content || '').trim();
  const firstLine = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);

  if (firstLine && /^#{1,6}\s+/.test(firstLine) && headingsMatch(firstLine, title)) {
    body = body.replace(/^#{1,6}\s+[^\n]+\n*/, '').trimStart();
  }

  return stripLeadingPlainTitleRepeat(body, title);
};

const stripInlineMarkdown = (value) =>
  String(value || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/^#+\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();

const isBrokenPostTitle = (title) => {
  const value = String(title || '').trim();
  if (!value) return true;
  // Cover image markdown — including truncated sync values ending in "..."
  if (/^!\[/i.test(value)) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^\[[^\]]+\]\(https?:\/\//i.test(value)) return true;
  if (/^\[[^\]]+\]\([^)]+\)$/.test(value)) return true;
  if (/\]\(https?:\/\/\S+\.{3}$/.test(value)) return true;
  return false;
};

const extractTitleFromContent = (content) => {
  for (const line of String(content || '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^##\s+(Media|Links|Tags)\b/i.test(trimmed)) break;
    if (/^#{1,6}\s+/.test(trimmed)) {
      return stripInlineMarkdown(trimmed);
    }
    if (/^[-*]\s+\[?(photo|video|image|audio)\]?/i.test(trimmed)) continue;

    const cleaned = stripInlineMarkdown(trimmed);
    if (cleaned.length > 3) return cleaned;
  }
  return '';
};

const resolvePostTitle = (post, fallback = 'Untitled post') => {
  const raw = String(post?.title || '').trim();
  if (!isBrokenPostTitle(raw)) return stripInlineMarkdown(raw);

  const fromContent = extractTitleFromContent(post?.content);
  if (fromContent) return fromContent;

  return fallback;
};

const stripSyncMetadata = (content) => {
  const body = String(content || '');
  const match = body.search(/\n## (Media|Links|Tags)\s*\n/i);
  return (match === -1 ? body : body.slice(0, match)).trim();
};

const seededRandom = (value) => {
  const text = String(value);
  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
};

const MAX_VISIBLE_TAG_NODES = 64;

const BrainGraph = ({ theme = 'cyber', language = 'en' }) => {
  const t = translations[language].brain;
  const dateLocale = language === 'ru' ? 'ru-RU' : 'en-US';
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50); // Keep the graph light enough for low-power GPUs
  const [showTags, setShowTags] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const themeColors = useMemo(() => {
    switch (theme) {
      case 'solar':
        return {
          primary: '#f2994a',
          secondary: '#eb5757',
          primaryGlow: 'rgba(242, 153, 74, 0.8)',
          secondaryGlow: 'rgba(235, 87, 87, 0.8)',
          primaryRgb: '242, 153, 74',
          secondaryRgb: '235, 87, 87'
        };
      case 'emerald':
        return {
          primary: '#22c55e',
          secondary: '#0f766e',
          primaryGlow: 'rgba(34, 197, 94, 0.8)',
          secondaryGlow: 'rgba(15, 118, 110, 0.8)',
          primaryRgb: '34, 197, 94',
          secondaryRgb: '15, 118, 110'
        };
      case 'void':
        return {
          primary: '#d1d5db',
          secondary: '#6b7280',
          primaryGlow: 'rgba(209, 213, 219, 0.8)',
          secondaryGlow: 'rgba(107, 114, 128, 0.8)',
          primaryRgb: '209, 213, 219',
          secondaryRgb: '107, 114, 128'
        };
      case 'cyber':
      default:
        return {
          primary: '#22d3ee',
          secondary: '#a855f7',
          primaryGlow: 'rgba(34, 211, 238, 0.8)',
          secondaryGlow: 'rgba(168, 85, 247, 0.8)',
          primaryRgb: '34, 211, 238',
          secondaryRgb: '168, 85, 247'
        };
    }
  }, [theme]);

  const themeColorsRef = useRef(themeColors);
  useEffect(() => {
    themeColorsRef.current = themeColors;
  }, [themeColors]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 0.8 });

  // Use refs for animation variables to prevent tearing down the render loop on state updates
  const hoveredNodeRef = useRef(null);
  const selectedPostRef = useRef(null);
  const selectedTagRef = useRef(null);
  const physicsEnabledRef = useRef(physicsEnabled);
  // Pre-built node lookup map — built once after data loads, not on every frame
  const nodeMapRef = useRef(new Map());

  // Touch gesture state refs
  const touchStartDistRef = useRef(0);
  const touchStartTransformRef = useRef(null);
  const touchStartCenterRef = useRef({ x: 0, y: 0 });

  // Set hover state only in the ref to prevent triggering React component re-renders during mouse moves
  const setHoveredNode = (node) => {
    hoveredNodeRef.current = node;
  };

  // Sync refs with state immediately
  useEffect(() => { selectedPostRef.current = selectedPost; }, [selectedPost]);
  useEffect(() => { selectedTagRef.current = selectedTag; }, [selectedTag]);
  useEffect(() => { physicsEnabledRef.current = physicsEnabled; }, [physicsEnabled]);

  // Auto-scroll to the reader panel on mobile screens when a post is selected
  useEffect(() => {
    if (selectedPost && window.innerWidth < 1024) {
      const readerElement = document.getElementById('brain-reader');
      if (readerElement) {
        // Delay slightly to allow the DOM to render the detail view container
        setTimeout(() => {
          readerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [selectedPost]);

  // Load and sanitize posts
  useEffect(() => {
    setLoadingData(true);
    fetch('/data/posts.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.posts) {
          setPosts(data.posts);
        }
        setLoadingData(false);
      })
      .catch(err => {
        console.error("Error loading posts data:", err);
        setLoadingData(false);
      });
  }, []);

  // Filter posts based on search query, limit, and selected tag
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by tag if selected
    if (selectedTag) {
      result = result.filter(p => p.tags.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        resolvePostTitle(p).toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by date and slice to limit
    return result.slice(0, limit);
  }, [posts, searchQuery, limit, selectedTag]);

  // Construct Graph Nodes and Links
  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeMap = new Map();
    const tagCounts = new Map();

    // 1. Create Post Nodes
    filteredPosts.forEach(post => {
      const node = {
        id: `post-${post.id}`,
        type: 'post',
        label: resolvePostTitle(post, t.untitledPost),
        size: 7,
        color: themeColors.primary,
        glowColor: themeColors.primaryGlow,
        data: post,
        x: seededRandom(`${post.id}:x`) * 500 - 250,
        y: seededRandom(`${post.id}:y`) * 500 - 250,
        vx: 0,
        vy: 0
      };
      nodes.push(node);
      nodeMap.set(node.id, node);

      if (showTags && post.tags) {
        post.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    // 2. Create Tag Nodes & Links
    if (showTags) {
      const visibleTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, MAX_VISIBLE_TAG_NODES);

      visibleTags.forEach(([tag, tagPostsCount]) => {
        if (tagPostsCount === 0) return;

        const tagNode = {
          id: `tag-${tag}`,
          type: 'tag',
          label: `#${tag}`,
          size: 9 + Math.min(tagPostsCount * 1.5, 15),
          color: themeColors.secondary,
          glowColor: themeColors.secondaryGlow,
          data: tag,
          x: seededRandom(`${tag}:x`) * 500 - 250,
          y: seededRandom(`${tag}:y`) * 500 - 250,
          vx: 0,
          vy: 0
        };
        nodes.push(tagNode);
        nodeMap.set(tagNode.id, tagNode);

        // Connect posts to this tag with wider distance
        filteredPosts.forEach(post => {
          if (post.tags.includes(tag)) {
            links.push({
              source: `post-${post.id}`,
              target: `tag-${tag}`,
              distance: 120 + seededRandom(`${post.id}:${tag}:distance`) * 60
            });
          }
        });
      });
    }

    // Connect posts to each other if no tags are visible
    if (!showTags) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const p1 = nodes[i].data;
          const p2 = nodes[j].data;
          const sharedTags = p1.tags.filter(t => p2.tags.includes(t));
          if (sharedTags.length >= 2) {
            links.push({
              source: nodes[i].id,
              target: nodes[j].id,
              distance: 150
            });
          }
        }
      }
    }

    return { nodes, links };
  }, [filteredPosts, showTags, themeColors, t.untitledPost]);

  // Keep track of current nodes state for canvas animation loop
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  useEffect(() => {
    const prevNodesMap = new Map(nodesRef.current.map(n => [n.id, n]));
    
    nodesRef.current = graphData.nodes.map(n => {
      const prev = prevNodesMap.get(n.id);
      if (prev) {
        return {
          ...n,
          x: prev.x,
          y: prev.y,
          vx: prev.vx,
          vy: prev.vy
        };
      }
      return n;
    });
    
    linksRef.current = graphData.links;

    // Rebuild the lookup map whenever nodes change
    nodeMapRef.current = new Map(nodesRef.current.map(n => [n.id, n]));

    // Clear hovered node if it's no longer in the active nodes list
    if (hoveredNodeRef.current) {
      const stillExists = nodesRef.current.some(n => n.id === hoveredNodeRef.current.id);
      if (!stillExists) {
        hoveredNodeRef.current = null;
      }
    }
  }, [graphData]);

  // Interaction states
  const dragNodeRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Markdown rendering
  const parsedMarkdown = useMemo(() => {
    if (!selectedPost) return '';
    try {
      const displayTitle = resolvePostTitle(selectedPost, t.untitledPost);
      const displayContent = stripSyncMetadata(
        stripHeadingMatchingTitle(selectedPost.content || '', displayTitle)
      );
      const rawHtml = marked.parse(displayContent);
      return DOMPurify.sanitize(rawHtml);
    } catch {
      return selectedPost.content || '';
    }
  }, [selectedPost, t.untitledPost]);

  // Main Render & Physics simulation loop (runs on mount only, using refs to avoid tearing down the canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = false;
    let intersectionObserver;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;

        canvas.width = width;
        canvas.height = height;

        // Center graph initially
        if (transformRef.current.x === 0 && transformRef.current.y === 0) {
          transformRef.current.x = width / 2;
          transformRef.current.y = height / 2;
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    const tick = (timestamp = 0) => {
      if (!isVisible) return;
      animationFrameId = requestAnimationFrame(tick);

      if (timestamp) {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed < frameInterval) return;
        lastFrameTime = timestamp - (elapsed % frameInterval);
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;
      
      // Use pre-built O(1) node lookup — rebuilt only when data changes, not every frame
      const nodeMap = nodeMapRef.current;

      if (physicsEnabledRef.current) {
        // Centering force: pull gently to center (0, 0)
        const gravity = 0.015;
        nodes.forEach(n => {
          n.vx -= n.x * gravity;
          n.vy -= n.y * gravity;
        });

        // Repulsion force (Coulomb's Law)
        const kRep = 3500;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const realDistSq = dx * dx + dy * dy;
            const dist = Math.sqrt(realDistSq) || 0.1;

            if (dist < 500) {
              // Add a softening factor of 400 to prevent division by zero or extreme velocity spikes (jitter/explosion)
              const force = kRep / (realDistSq + 400);
              const fx = (dx / dist) * force;
              const fy = (dy / dist) * force;

              if (dragNodeRef.current !== n1) {
                n1.vx -= fx;
                n1.vy -= fy;
              }
              if (dragNodeRef.current !== n2) {
                n2.vx += fx;
                n2.vy += fy;
              }
            }
          }
        }

        // Attraction force along links (Hooke's Law)
        const kAtt = 0.035;
        links.forEach(l => {
          const nSource = nodeMap.get(l.source);
          const nTarget = nodeMap.get(l.target);
          if (!nSource || !nTarget) return;

          const dx = nTarget.x - nSource.x;
          const dy = nTarget.y - nSource.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
          const targetDist = l.distance || 100;
          const diff = dist - targetDist;
          const force = diff * kAtt;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (dragNodeRef.current !== nSource) {
            nSource.vx += fx;
            nSource.vy += fy;
          }
          if (dragNodeRef.current !== nTarget) {
            nTarget.vx -= fx;
            nTarget.vy -= fy;
          }
        });

        // Update positions with speed capping and hover-freeze to prevent jitter
        const friction = 0.85;
        const maxSpeed = 12;
        nodes.forEach(n => {
          // Freeze position if dragged OR if hovered to prevent oscillation/flicker
          const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === n.id;
          if (dragNodeRef.current === n || isHovered) {
            n.vx = 0;
            n.vy = 0;
            return;
          }

          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (speed > maxSpeed) {
            n.vx = (n.vx / speed) * maxSpeed;
            n.vy = (n.vy / speed) * maxSpeed;
          }

          n.x += n.vx;
          n.y += n.vy;
          n.vx *= friction;
          n.vy *= friction;
        });
      }

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const transform = transformRef.current;
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Draw grid
      const gridSpacing = 80;
      const startX = -transform.x / transform.scale - gridSpacing;
      const endX = (canvas.width - transform.x) / transform.scale + gridSpacing;
      const startY = -transform.y / transform.scale - gridSpacing;
      const endY = (canvas.height - transform.y) / transform.scale + gridSpacing;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1 / transform.scale;
      
      ctx.beginPath();
      for (let x = Math.floor(startX / gridSpacing) * gridSpacing; x < endX; x += gridSpacing) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = Math.floor(startY / gridSpacing) * gridSpacing; y < endY; y += gridSpacing) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // Draw Links - optimized with nodeMap O(1) lookup
      ctx.lineWidth = 1.0 / transform.scale;
      linksRef.current.forEach(l => {
        const source = nodeMap.get(l.source);
        const target = nodeMap.get(l.target);
        if (!source || !target) return;

        let opacity = 0.12;
        let color = 'rgba(255,255,255,';

        const colors = themeColorsRef.current;
        const isHoveredSourceOrTarget = hoveredNodeRef.current && (hoveredNodeRef.current.id === source.id || hoveredNodeRef.current.id === target.id);
        const isSelectedSourceOrTarget = selectedPostRef.current && 
          ((source.type === 'post' && source.data.id === selectedPostRef.current.id) || 
           (target.type === 'post' && target.data.id === selectedPostRef.current.id));

        if (isHoveredSourceOrTarget) {
          opacity = 0.5;
          color = target.type === 'tag' ? `rgba(${colors.secondaryRgb},` : `rgba(${colors.primaryRgb},`;
        } else if (isSelectedSourceOrTarget) {
          opacity = 0.7;
          color = `rgba(${colors.primaryRgb},`;
        }

        ctx.strokeStyle = `${color}${opacity})`;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      // Draw Nodes
      nodesRef.current.forEach(n => {
        const isHovered = hoveredNodeRef.current && hoveredNodeRef.current.id === n.id;
        const isSelected = selectedPostRef.current && n.type === 'post' && n.data.id === selectedPostRef.current.id;
        const isCurrentTagFiltered = selectedTagRef.current && n.type === 'tag' && n.data === selectedTagRef.current;

        ctx.save();
        ctx.beginPath();
        
        const radius = isHovered ? n.size * 1.25 : n.size;
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;

        if (isHovered || isSelected || isCurrentTagFiltered) {
          ctx.shadowColor = n.glowColor;
          ctx.shadowBlur = 15;
        }

        ctx.fill();

        if (isSelected || isCurrentTagFiltered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8 / transform.scale;
          ctx.stroke();
        }

        ctx.restore();

        const colors = themeColorsRef.current;
        const showLabel = n.type === 'tag' || isHovered || isSelected || isCurrentTagFiltered;
        if (showLabel) {
          ctx.fillStyle = isHovered ? '#ffffff' : (n.type === 'tag' ? colors.secondary : '#e2e8f0');
          ctx.font = n.type === 'tag' 
            ? `bold ${Math.max(10, 11 / transform.scale)}px Space Grotesk, sans-serif`
            : `${Math.max(9, 10 / transform.scale)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          let labelText = n.label;
          if (n.type === 'post' && labelText.length > 25) {
            labelText = labelText.slice(0, 23) + '...';
          }

          ctx.fillText(labelText, n.x, n.y + radius + 5);
        }
      });

      ctx.restore();
    };

    intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const wasVisible = isVisible;
      isVisible = entry.isIntersecting;

      if (isVisible && !wasVisible) {
        cancelAnimationFrame(animationFrameId);
        lastFrameTime = performance.now();
        tick(lastFrameTime);
      }
    }, { threshold: 0.01 });

    if (containerRef.current) {
      intersectionObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Run once on mount!

  // Mouse coordinate conversions
  const screenToGraph = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const transform = transformRef.current;
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top - transform.y) / transform.scale
    };
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

    const pos = screenToGraph(e.clientX, e.clientY);
    const clickRadius = 15;
    const clickedNode = nodesRef.current.find(n => {
      const dx = n.x - pos.x;
      const dy = n.y - pos.y;
      return Math.sqrt(dx * dx + dy * dy) < (n.size + clickRadius);
    });

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
      dragStartRef.current = { x: pos.x - clickedNode.x, y: pos.y - clickedNode.y };
      clickedNode.vx = 0;
      clickedNode.vy = 0;
    } else {
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e) => {
    const pos = screenToGraph(e.clientX, e.clientY);

    if (dragNodeRef.current) {
      const node = dragNodeRef.current;
      node.x = pos.x - dragStartRef.current.x;
      node.y = pos.y - dragStartRef.current.y;
      node.vx = 0;
      node.vy = 0;
    } else if (isPanningRef.current) {
      transformRef.current = {
        ...transformRef.current,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      };
    } else {
      const hoverRadius = 12;
      const stickyPadding = 6;
      let currentHovered = hoveredNodeRef.current;

      // Sticky hover hysteresis: if a node is already hovered, check if the mouse is still within its padded range
      if (currentHovered) {
        const dx = currentHovered.x - pos.x;
        const dy = currentHovered.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= currentHovered.size + hoverRadius + stickyPadding) {
          currentHovered = null; // Mouse moved too far away, release sticky hover
        }
      }

      // If we don't have a sticky hover, find the closest node within the hover range
      if (!currentHovered) {
        let closestNode = null;
        let minDistance = Infinity;

        nodesRef.current.forEach(n => {
          const dx = n.x - pos.x;
          const dy = n.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = n.size + hoverRadius;
          if (dist < maxDist && dist < minDistance) {
            minDistance = dist;
            closestNode = n;
          }
        });

        currentHovered = closestNode;
      }

      // Update hover state only when changed to avoid React trigger spam
      if (currentHovered !== hoveredNodeRef.current) {
        setHoveredNode(currentHovered);
        if (currentHovered) {
          const canvas = canvasRef.current;
          const transform = transformRef.current;
          if (canvas && transform) {
            const screenX = currentHovered.x * transform.scale + transform.x;
            const xRatio = (screenX / canvas.width) * 2 - 1;
            AudioService.playSpatialNode(currentHovered.type, xRatio);
          }
        }
      }
    }
  };

  const handleMouseUp = (e) => {
    if (dragNodeRef.current) {
      const node = dragNodeRef.current;
      const pos = screenToGraph(e.clientX, e.clientY);
      const dragDist = Math.sqrt(
        Math.pow(pos.x - (node.x + dragStartRef.current.x), 2) +
        Math.pow(pos.y - (node.y + dragStartRef.current.y), 2)
      );

      if (dragDist < 5) {
        if (node.type === 'post') {
          setSelectedPost(node.data);
        } else if (node.type === 'tag') {
          setSelectedTag(prev => prev === node.data ? null : node.data);
        }
      }
      dragNodeRef.current = null;
    }
    isPanningRef.current = false;
  };

  function handleTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = screenToGraph(touch.clientX, touch.clientY);
      const clickRadius = 25; // Wider touch radius for mobile fingers
      const clickedNode = nodesRef.current.find(n => {
        const dx = n.x - pos.x;
        const dy = n.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < (n.size + clickRadius);
      });

      if (clickedNode) {
        dragNodeRef.current = clickedNode;
        dragStartRef.current = { x: pos.x - clickedNode.x, y: pos.y - clickedNode.y };
        clickedNode.vx = 0;
        clickedNode.vy = 0;
        e.preventDefault(); // Stop page scrolling when dragging a node
      } else {
        isPanningRef.current = true;
        panStartRef.current = { x: touch.clientX - transformRef.current.x, y: touch.clientY - transformRef.current.y };
        e.preventDefault(); // Stop page scrolling when panning the graph
      }
    } else if (e.touches.length === 2) {
      isPanningRef.current = false;
      dragNodeRef.current = null;

      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      touchStartDistRef.current = dist;
      touchStartTransformRef.current = { ...transformRef.current };
      touchStartCenterRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      e.preventDefault();
    }
  }

  function handleTouchMove(e) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (dragNodeRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const pos = screenToGraph(touch.clientX, touch.clientY);
      const node = dragNodeRef.current;
      node.x = pos.x - dragStartRef.current.x;
      node.y = pos.y - dragStartRef.current.y;
      node.vx = 0;
      node.vy = 0;
      e.preventDefault();
    } else if (isPanningRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      transformRef.current = {
        ...transformRef.current,
        x: touch.clientX - panStartRef.current.x,
        y: touch.clientY - panStartRef.current.y
      };
      e.preventDefault();
    } else if (e.touches.length === 2 && touchStartTransformRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const centerX = (t1.clientX + t2.clientX) / 2;
      const centerY = (t1.clientY + t2.clientY) / 2;

      const startDist = touchStartDistRef.current || 1;
      const startTransform = touchStartTransformRef.current;
      const startCenter = touchStartCenterRef.current;

      const scaleFactor = dist / startDist;
      const newScale = Math.min(Math.max(0.1, startTransform.scale * scaleFactor), 4);

      const dCenterX = centerX - startCenter.x;
      const dCenterY = centerY - startCenter.y;

      const rect = canvas.getBoundingClientRect();
      const focusX = centerX - rect.left;
      const focusY = centerY - rect.top;

      const graphFocusX = (focusX - startTransform.x) / startTransform.scale;
      const graphFocusY = (focusY - startTransform.y) / startTransform.scale;

      transformRef.current = {
        scale: newScale,
        x: focusX - graphFocusX * newScale + dCenterX,
        y: focusY - graphFocusY * newScale + dCenterY
      };
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (dragNodeRef.current) {
      const node = dragNodeRef.current;
      let isTap = false;

      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const pos = screenToGraph(touch.clientX, touch.clientY);
        const dragDist = Math.sqrt(
          Math.pow(pos.x - (node.x + dragStartRef.current.x), 2) +
          Math.pow(pos.y - (node.y + dragStartRef.current.y), 2)
        );
        if (dragDist < 10) { // slightly more generous tolerance for fingers
          isTap = true;
        }
      } else {
        isTap = true;
      }

      if (isTap) {
        if (node.type === 'post') {
          setSelectedPost(node.data);
        } else if (node.type === 'tag') {
          setSelectedTag(prev => prev === node.data ? null : node.data);
        }

        // Play spatial audio chime/blip on tap on mobile touch devices
        const canvas = canvasRef.current;
        const transform = transformRef.current;
        if (canvas && transform) {
          const screenX = node.x * transform.scale + transform.x;
          const xRatio = (screenX / canvas.width) * 2 - 1;
          AudioService.playSpatialNode(node.type, xRatio);
        }
      }
      dragNodeRef.current = null;
    }

    isPanningRef.current = false;
    touchStartTransformRef.current = null;
  }

  // Non-passive wheel & touch event listener registration for page-scroll prevention and smooth interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Stop main page scrolling

      const zoomIntensity = 0.05;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const transform = transformRef.current;
      const currentScale = transform.scale;

      const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
      const newScale = Math.min(Math.max(0.1, currentScale * zoomFactor), 4);

      const graphMouseX = (mouseX - transform.x) / currentScale;
      const graphMouseY = (mouseY - transform.y) / currentScale;

      transformRef.current = {
        scale: newScale,
        x: mouseX - graphMouseX * newScale,
        y: mouseY - graphMouseY * newScale
      };
    };

    const onTouchStart = (e) => handleTouchStart(e);
    const onTouchMove = (e) => handleTouchMove(e);
    const onTouchEnd = (e) => handleTouchEnd(e);

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
    // The handlers read mutable refs, so this listener should be bound once for the canvas lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleResetLayout = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    transformRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      scale: 0.8
    };

    nodesRef.current.forEach(n => {
      n.x = Math.random() * 400 - 200;
      n.y = Math.random() * 400 - 200;
      n.vx = 0;
      n.vy = 0;
    });
  };

  return (
    <section id="brain" className="w-full min-h-screen py-24 bg-cyber-black relative overflow-hidden flex flex-col justify-center border-b border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-purple/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-cyber-cyan/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col flex-grow z-10">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left reveal reveal-scale active">
          <div className="inline-block px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple text-xs font-black tracking-widest uppercase rounded-full mb-3">
            {t.badge}
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-wider uppercase mb-4">
            {t.heading} <span className="text-cyber-cyan">{t.headingAccent}</span> {t.headingSuffix}
          </h2>
          <p className="text-gray-400 max-w-2xl text-sm md:text-base font-display">
            {t.subheading}. {t.hint}
          </p>
        </div>

        {/* Toolbar & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6 reveal reveal-scale active delay-100">
          
          {/* Search bar */}
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cyber-dark/80 border border-white/10 hover:border-cyber-cyan/50 focus:border-cyber-cyan text-white text-sm pl-10 pr-4 py-3 rounded-xl backdrop-blur-md outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtering & Settings options */}
          <div className="lg:col-span-7 flex flex-wrap gap-2 md:gap-3 items-center justify-start lg:justify-end">
            
            {selectedTag && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-cyber-purple/20 border border-cyber-purple/40 text-cyber-purple text-xs font-medium rounded-lg">
                <Filter className="w-3.5 h-3.5" />
                <span>#{selectedTag}</span>
                <button onClick={() => setSelectedTag(null)} className="hover:text-white ml-1">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Post limit slider */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-cyber-dark/60 border border-white/5 rounded-xl text-xs text-gray-400 backdrop-blur-md">
              <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
              <span>{t.limit}: {limit}</span>
              <input 
                type="range"
                min="20"
                max="250"
                step="10"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-20 md:w-28 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
              />
            </div>

            {/* Toggle tag nodes */}
            <button 
              onClick={() => setShowTags(prev => !prev)}
              className={`px-4 py-2.5 border rounded-full text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer ${
                showTags 
                  ? 'bg-cyber-purple/10 border-cyber-purple/30 text-cyber-purple hover:bg-cyber-purple/20' 
                  : 'bg-cyber-dark/40 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{showTags ? t.hideTags : t.showTags}</span>
            </button>

            {/* Physics switch */}
            <button 
              onClick={() => setPhysicsEnabled(prev => !prev)}
              className={`px-4 py-2.5 border rounded-full text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
                physicsEnabled 
                  ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/20' 
                  : 'bg-cyber-dark/40 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <span>{physicsEnabled ? t.freeze : t.simulate}</span>
            </button>

            {/* Recenter button */}
            <button 
              onClick={handleResetLayout}
              className="p-2.5 bg-cyber-dark/40 hover:bg-cyber-dark/80 border border-white/5 hover:border-white/20 text-gray-400 hover:text-white rounded-full transition-all cursor-pointer"
              title={t.recenterTitle}
              aria-label={t.recenterTitle}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-6 reveal active">
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500 mr-2">{t.quickFilters}</span>
            <button
                onClick={() => { setSelectedTag(null); AudioService.playTick(); }}
                className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition-all cursor-pointer ${
                    !selectedTag
                        ? 'bg-cyber-cyan text-black border-cyber-cyan shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.3)] font-bold'
                        : 'bg-transparent text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
            >
                {t.filterAll}
            </button>
            {t.filters.map(item => (
                <button
                    key={item.tag}
                    onClick={() => {
                        setSelectedTag(item.tag);
                        AudioService.playTick();
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border transition-all cursor-pointer ${
                        selectedTag === item.tag
                            ? 'bg-cyber-purple text-white border-cyber-purple shadow-[0_0_10px_rgba(var(--secondary-color-rgb),0.3)] font-bold'
                            : 'bg-transparent text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                >
                    {item.label}
                </button>
            ))}
        </div>

        {/* Dual-Column Main Workspace Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative flex-grow w-full reveal reveal-scale active delay-200">
          
          {/* LEFT PANEL: Canvas Graph View (8 columns) */}
          <div className="lg:col-span-8 h-[350px] sm:h-[400px] lg:h-[600px] rounded-2xl border border-white/10 bg-cyber-dark/40 backdrop-blur-sm overflow-hidden relative">
            
            {/* Legend and node counts overlay */}
            <div className="absolute left-4 top-4 z-10 bg-cyber-black/70 border border-white/5 backdrop-blur-md px-3 py-2.5 rounded-lg text-[10px] md:text-xs text-gray-400 space-y-1.5 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyber-cyan rounded-full shadow-[0_0_6px_var(--primary-color)]" />
                <span>{t.posts} ({filteredPosts.length})</span>
              </div>
              {showTags && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyber-purple rounded-full shadow-[0_0_6px_var(--secondary-color)]" />
                  <span>{t.tags} ({graphData.nodes.filter(n => n.type === 'tag').length})</span>
                </div>
              )}
              <div className="border-t border-white/5 my-1" />
              <div className="text-[10px] text-gray-500">{t.links}: {graphData.links.length}</div>
            </div>

            {/* Canvas wrapper */}
            <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="absolute top-0 left-0 w-full h-full block touch-none"
              />
              {loadingData && (
                <div className="absolute inset-0 bg-cyber-dark/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 z-10">
                  <div className="w-12 h-12 border-4 border-cyber-cyan border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.2)]"></div>
                  <div className="text-sm font-cyber uppercase tracking-widest text-cyber-cyan animate-pulse">{t.loading}</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Scrollable Post Feed / Article Reader (4 columns) */}
          <div id="brain-reader" className="lg:col-span-4 h-[400px] lg:h-[600px] rounded-2xl border border-white/10 bg-cyber-dark/60 backdrop-blur-md overflow-hidden flex flex-col relative">
            
            {selectedPost ? (
              /* DETAILED VIEW MODE */
              <div className="h-full flex flex-col">
                {/* Header with Back button */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center gap-4 bg-cyber-black/40">
                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="flex items-center gap-1.5 text-xs text-cyber-cyan font-bold uppercase tracking-wider hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.backToFeed}</span>
                  </button>
                  <span className="text-[10px] text-gray-500 font-cyber">#{selectedPost.id}</span>
                </div>

                {/* Article Reader Body */}
                <div className="p-5 overflow-y-auto flex-grow space-y-5 scrollbar">
                  
                  {/* Metadata info cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 px-2.5 py-2 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t.date}
                      </span>
                      <span className="text-[11px] text-white">
                        {new Date(selectedPost.date).toLocaleDateString(dateLocale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="bg-white/5 px-2.5 py-2 rounded-lg border border-white/5 flex flex-col">
                      <span className="text-[9px] uppercase text-gray-500 font-semibold mb-0.5 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Source
                      </span>
                      <span className="text-[11px] text-white truncate">
                        {selectedPost.channel}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-black text-white leading-snug border-b border-white/5 pb-3">
                    {resolvePostTitle(selectedPost, t.untitledPost)}
                  </h3>

                  {/* Body Content */}
                  <div 
                    className="markdown-content text-xs md:text-sm text-gray-300 space-y-3"
                    dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
                  />

                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <div className="text-[9px] uppercase text-gray-500 font-semibold mb-1.5">{t.tagsHeading}</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedPost.tags.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => {
                              setSelectedTag(tag);
                              setSelectedPost(null);
                            }}
                            className="text-[9px] font-medium bg-cyber-purple/10 hover:bg-cyber-purple/20 border border-cyber-purple/30 text-cyber-purple px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer with Telegram Link */}
                <div className="p-4 border-t border-white/10 bg-cyber-dark/80 flex items-center">
                  <a 
                    href={`https://t.me/c/${String(selectedPost.telegram_chat_id).replace('-100', '')}/${selectedPost.telegram_message_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-cyber-cyan hover:bg-cyber-cyan/80 text-black text-xs font-black tracking-widest uppercase rounded-full transition-all shadow-[0_0_10px_rgba(var(--primary-color-rgb),0.2)] hover:shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.4)]"
                  >
                    <span>Open in Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              /* LIST VIEW MODE (FEED) */
              <div className="h-full flex flex-col">
                
                {/* Feed Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyber-black/40">
                  <div className="flex items-center gap-1.5 text-xs text-cyber-purple font-black uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-cyber-purple" />
                    <span>{t.postFeed} ({filteredPosts.length})</span>
                  </div>
                  {selectedTag && (
                    <button 
                      onClick={() => setSelectedTag(null)}
                      className="text-[9px] text-gray-500 hover:text-white uppercase font-bold"
                    >
                      {t.clearFilter}
                    </button>
                  )}
                </div>

                {/* Post Cards List */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3 scrollbar">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                      <div 
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="group p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyber-cyan/30 cursor-pointer transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[9px] text-gray-500">
                              {new Date(post.date).toLocaleDateString(dateLocale, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyber-cyan transition-colors" />
                          </div>
                          <h4 className="text-xs md:text-sm font-bold text-white group-hover:text-cyber-cyan line-clamp-2 transition-colors">
                            {resolvePostTitle(post, t.untitledPost)}
                          </h4>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3.5">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[8px] font-medium text-cyber-purple/80 bg-cyber-purple/5 border border-cyber-purple/10 px-1 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-[8px] text-gray-500 font-semibold mt-0.5">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2 py-10">
                      <Search className="w-6 h-6 opacity-30 text-cyber-purple" />
                      <span className="text-xs uppercase tracking-wider font-semibold">{t.noPostsFound}</span>
                      <span className="text-[10px] text-center text-gray-600 max-w-[180px]">
                        {t.noPostsHint}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};

export default BrainGraph;
