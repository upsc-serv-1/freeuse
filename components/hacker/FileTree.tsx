import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface TreeNode {
  name: string;
  type: "dir" | "file";
  children?: TreeNode[];
  expanded?: boolean;
  size?: string;
  perms?: string;
}

const INITIAL_TREE: TreeNode[] = [
  {
    name: "/", type: "dir", expanded: true, perms: "drwxr-xr-x",
    children: [
      { name: "bin/", type: "dir", perms: "drwxr-xr-x", children: [
        { name: "sh", type: "file", size: "122K", perms: "-rwxr-xr-x" },
        { name: "ls", type: "file", size: "72K", perms: "-rwxr-xr-x" },
        { name: "cat", type: "file", size: "44K", perms: "-rwxr-xr-x" },
      ]},
      { name: "data/", type: "dir", perms: "drwx------", children: [
        { name: "app/", type: "dir", perms: "drwxrwx--x", children: [] },
        { name: "local/", type: "dir", perms: "drwxrwx--x", children: [] },
        { name: "media/", type: "dir", perms: "drwxrwx--x", children: [] },
      ]},
      { name: "dev/", type: "dir", perms: "drwxr-xr-x", children: [
        { name: "null", type: "file", size: "0", perms: "crw-rw-rw-" },
        { name: "random", type: "file", size: "0", perms: "crw-rw-rw-" },
        { name: "tty0", type: "file", size: "0", perms: "crw--w----" },
      ]},
      { name: "etc/", type: "dir", perms: "drwxr-xr-x", children: [
        { name: "passwd", type: "file", size: "1.4K", perms: "-rw-r--r--" },
        { name: "shadow", type: "file", size: "892", perms: "-rw------- 🔒" },
        { name: "hosts", type: "file", size: "174", perms: "-rw-r--r--" },
        { name: "fstab", type: "file", size: "512", perms: "-rw-r--r--" },
      ]},
      { name: "proc/", type: "dir", perms: "dr-xr-xr-x", children: [
        { name: "cpuinfo", type: "file", size: "0", perms: "-r--r--r--" },
        { name: "meminfo", type: "file", size: "0", perms: "-r--r--r--" },
        { name: "net/", type: "dir", perms: "dr-xr-xr-x", children: [] },
      ]},
      { name: "sys/", type: "dir", perms: "dr-xr-xr-x", children: [
        { name: "kernel/", type: "dir", perms: "dr-xr-xr-x", children: [] },
        { name: "fs/", type: "dir", perms: "dr-xr-xr-x", children: [] },
      ]},
      { name: "system/", type: "dir", perms: "drwxr-xr-x", children: [
        { name: "app/", type: "dir", perms: "drwxr-xr-x", children: [] },
        { name: "lib/", type: "dir", perms: "drwxr-xr-x", children: [] },
        { name: "framework/", type: "dir", perms: "drwxr-xr-x", children: [] },
      ]},
      { name: "tmp/", type: "dir", perms: "drwxrwxrwt", children: [] },
    ],
  },
];

function toggleNodeAt(tree: TreeNode[], path: number[]): TreeNode[] {
  if (path.length === 0) return tree;
  const [head, ...rest] = path;
  return tree.map((node, i) => {
    if (i !== head) return node;
    if (rest.length === 0) return { ...node, expanded: !node.expanded };
    return { ...node, children: node.children ? toggleNodeAt(node.children, rest) : node.children };
  });
}

function TreeNodeView({
  node, depth, prefix, isLast, color, onToggle, path,
}: {
  node: TreeNode; depth: number; prefix: string; isLast: boolean;
  color: string; onToggle: (path: number[]) => void; path: number[];
}) {
  const connector = isLast ? "└── " : "├── ";
  const childPrefix = prefix + (isLast ? "    " : "│   ");
  const dim = `${color}AA`;
  const faint = `${color}60`;

  return (
    <View>
      <TouchableOpacity
        onPress={() => node.type === "dir" && node.children ? onToggle(path) : undefined}
        className="flex-row items-center"
        style={{ paddingLeft: depth === 0 ? 0 : undefined, marginBottom: 1 }}
        activeOpacity={0.6}
      >
        <Text style={{ color: faint, fontFamily: "monospace", fontSize: 10 }}>
          {prefix}{connector}
        </Text>
        {node.type === "dir" ? (
          <Text style={{ color, fontFamily: "monospace", fontSize: 10 }}>
            {node.expanded ? "▾ " : "▸ "}{node.name}
          </Text>
        ) : (
          <Text style={{ color: dim, fontFamily: "monospace", fontSize: 10 }}>{node.name}</Text>
        )}
        {node.size && <Text style={{ color: faint, fontFamily: "monospace", fontSize: 8, marginLeft: "auto" }}>{node.size}</Text>}
      </TouchableOpacity>
      {node.type === "dir" && node.expanded && node.children && node.children.map((child, i) => (
        <TreeNodeView
          key={child.name}
          node={child}
          depth={depth + 1}
          prefix={childPrefix}
          isLast={i === (node.children!.length - 1)}
          color={color}
          onToggle={(subPath) => onToggle([...path, i, ...subPath])}
          path={[]}
        />
      ))}
    </View>
  );
}

export function FileTree({ color }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>(INITIAL_TREE);
  const dim = `${color}CC`;
  const faint = `${color}60`;

  const handleToggle = (pathFromRoot: number[]) => {
    setTree(prev => {
      const [rootIdx, ...childPath] = pathFromRoot;
      if (childPath.length === 0) {
        return prev.map((n, i) => i === rootIdx ? { ...n, expanded: !n.expanded } : n);
      }
      return prev.map((n, i) => {
        if (i !== rootIdx) return n;
        return { ...n, children: n.children ? toggleNodeAt(n.children, childPath) : n.children };
      });
    });
  };

  return (
    <View
      className="rounded-xl overflow-hidden mb-4"
      style={{
        borderColor: `${color}40`,
        borderWidth: 1,
        backgroundColor: `${color}08`,
      }}
    >
      <View
        className="px-3 py-1"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: `${color}30`,
          backgroundColor: `${color}15`,
        }}
      >
        <Text style={{ color, fontFamily: "monospace", fontSize: 10, letterSpacing: 1 }}>
          ▸ FILESYSTEM ── /root ────────────────
        </Text>
      </View>
      <ScrollView style={{ maxHeight: 180, paddingHorizontal: 8, paddingVertical: 4 }}>
        <View className="flex-row items-center mb-1">
          <Text style={{ color, fontFamily: "monospace", fontSize: 10, fontWeight: "700" }}>
            {tree[0].expanded ? "▾" : "▸"} {tree[0].name}
          </Text>
          <Text style={{ color: faint, fontFamily: "monospace", fontSize: 8, marginLeft: 4 }}>{tree[0].perms}</Text>
        </View>
        {tree[0].expanded && tree[0].children?.map((child, i) => (
          <TreeNodeView
            key={child.name}
            node={child}
            depth={1}
            prefix=""
            isLast={i === (tree[0].children!.length - 1)}
            color={color}
            onToggle={(subPath) => handleToggle([0, i, ...subPath])}
            path={[]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface FileTreeProps {
  color: string;
}