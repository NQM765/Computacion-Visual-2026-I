"""
Script de demostración de proyección en perspectiva.
Muestra 4 visualizaciones clave:
1. Cubo antes de dividir por w (clip space)
2. Cubo después de dividir por w (NDC)
3. Cambio al mover la cámara
4. Efecto del near plane
"""

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def perspective(fov_y_deg, aspect, near, far):
    """
    Crea una matriz de proyección en perspectiva.
    
    Args:
        fov_y_deg (float): Campo de visión vertical en grados
        aspect (float): Relación de aspecto (ancho/alto)
        near (float): Distancia al plano de recorte cercano
        far (float): Distancia al plano de recorte lejano
    
    Returns:
        np.ndarray: Matriz de proyección 4x4
    """
    f = 1.0 / np.tan(np.deg2rad(fov_y_deg) / 2.0)
    P = np.zeros((4, 4), dtype=float)
    P[0, 0] = f / aspect
    P[1, 1] = f
    P[2, 2] = (far + near) / (near - far)
    P[2, 3] = (2 * far * near) / (near - far)
    P[3, 2] = -1.0
    return P

def view_matrix(eye, target, up):
    """
    Crea una matriz de vista (view matrix) para posicionar la cámara.
    
    Args:
        eye (np.ndarray): Posición de la cámara
        target (np.ndarray): Punto al que mira la cámara
        up (np.ndarray): Vector "arriba" de la cámara
    
    Returns:
        np.ndarray: Matriz de vista 4x4
    """
    # Calcular vectores de la cámara
    forward = target - eye
    forward = forward / np.linalg.norm(forward)
    
    right = np.cross(forward, up)
    right = right / np.linalg.norm(right)
    
    up_corrected = np.cross(right, forward)
    
    # Construir matriz de vista
    V = np.eye(4)
    V[0, :3] = right
    V[1, :3] = up_corrected
    V[2, :3] = -forward
    V[:3, 3] = -np.array([np.dot(right, eye), 
                           np.dot(up_corrected, eye), 
                           np.dot(forward, eye)])
    return V

def create_cube(center, size):
    """
    Crea los vértices de un cubo.
    
    Args:
        center (tuple): Centro del cubo (x, y, z)
        size (float): Tamaño del cubo
    
    Returns:
        np.ndarray: Array de vértices (8, 3)
    """
    s = size / 2
    cx, cy, cz = center
    vertices = np.array([
        [cx-s, cy-s, cz-s], [cx+s, cy-s, cz-s],
        [cx+s, cy+s, cz-s], [cx-s, cy+s, cz-s],
        [cx-s, cy-s, cz+s], [cx+s, cy-s, cz+s],
        [cx+s, cy+s, cz+s], [cx-s, cy+s, cz+s],
    ])
    return vertices

def get_cube_edges():
    """
    Define las aristas del cubo como pares de índices de vértices.
    
    Returns:
        list: Lista de tuplas con índices de vértices conectados
    """
    return [
        (0,1), (1,2), (2,3), (3,0),  # Cara frontal
        (4,5), (5,6), (6,7), (7,4),  # Cara trasera
        (0,4), (1,5), (2,6), (3,7),  # Conexiones
    ]

def to_homogeneous(points3):
    """Convierte puntos 3D a coordenadas homogéneas 4D."""
    ones = np.ones((points3.shape[0], 1))
    return np.concatenate([points3, ones], axis=1)

def transform_points(V, P, points3):
    """
    Transforma puntos 3D a través de las matrices de vista y proyección.
    
    Args:
        V (np.ndarray): Matriz de vista 4x4
        P (np.ndarray): Matriz de proyección 4x4
        points3 (np.ndarray): Puntos 3D (N, 3)
    
    Returns:
        tuple: (clip, ndc)
            - clip: Coordenadas en clip space (N, 4)
            - ndc: Coordenadas NDC (N, 3)
    """
    ph = to_homogeneous(points3)
    view_space = (V @ ph.T).T
    clip = (P @ view_space.T).T
    w = clip[:, 3:4]
    ndc = clip[:, 0:3] / w
    return clip, ndc

def draw_cube_edges(ax, vertices, edges, color='blue', label=None, linewidth=1.5):
    """Dibuja las aristas de un cubo."""
    for i, (start, end) in enumerate(edges):
        v1, v2 = vertices[start], vertices[end]
        ax.plot([v1[0], v2[0]], [v1[1], v2[1]], [v1[2], v2[2]], 
                color=color, linewidth=linewidth, 
                label=label if i == 0 else None)

def draw_cube_2d(ax, vertices, edges, color='blue', label=None):
    """Dibuja las aristas de un cubo en 2D (proyección XY)."""
    for i, (start, end) in enumerate(edges):
        v1, v2 = vertices[start], vertices[end]
        ax.plot([v1[0], v2[0]], [v1[1], v2[1]], 
                color=color, linewidth=1.5, 
                label=label if i == 0 else None)

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Crear matriz de proyección
P = perspective(fov_y_deg=60, aspect=1.0, near=0.5, far=50.0)

# Crear cubo
cube = create_cube(center=(0, 0, -5), size=2.0)
edges = get_cube_edges()

# Posiciones de cámara
camera1 = np.array([0, 0, 0])
camera2 = np.array([3, 2, 0])
target = np.array([0, 0, -5])
up = np.array([0, 1, 0])

# Matrices de vista
V1 = view_matrix(camera1, target, up)
V2 = view_matrix(camera2, target, up)

# ============================================================================
# FIGURA 1: CUBO ANTES DE DIVIDIR (CLIP SPACE)
# ============================================================================

clip1, ndc1 = transform_points(V1, P, cube)

fig = plt.figure(figsize=(16, 10))

# Subplot 1: Cubo antes de dividir por w
ax1 = fig.add_subplot(2, 2, 1, projection='3d')
draw_cube_edges(ax1, clip1[:, :3], edges, color='red', label='Clip space')
ax1.set_xlabel('X (clip)')
ax1.set_ylabel('Y (clip)')
ax1.set_zlabel('Z (clip)')
ax1.set_title('1. Cubo ANTES de dividir por w\n(Clip Space - distorsionado)', fontsize=12, fontweight='bold')
ax1.legend()
ax1.set_box_aspect([1,1,1])

# ============================================================================
# FIGURA 2: CUBO DESPUÉS DE DIVIDIR (NDC)
# ============================================================================

ax2 = fig.add_subplot(2, 2, 2, projection='3d')
draw_cube_edges(ax2, ndc1, edges, color='blue', label='NDC')
ax2.set_xlabel('X (NDC)')
ax2.set_ylabel('Y (NDC)')
ax2.set_zlabel('Z (NDC)')
ax2.set_title('2. Cubo DESPUÉS de dividir por w\n(NDC - con perspectiva correcta)', fontsize=12, fontweight='bold')
ax2.set_xlim([-1, 1])
ax2.set_ylim([-1, 1])
ax2.set_zlim([-1, 1])
ax2.legend()
ax2.set_box_aspect([1,1,1])

# ============================================================================
# FIGURA 3: CAMBIO AL MOVER LA CÁMARA
# ============================================================================

clip2, ndc2 = transform_points(V2, P, cube)

ax3 = fig.add_subplot(2, 2, 3)
draw_cube_2d(ax3, ndc1, edges, color='blue', label='Cámara en (0,0,0)')
draw_cube_2d(ax3, ndc2, edges, color='green', label='Cámara en (3,2,0)')
ax3.set_xlabel('X (NDC)')
ax3.set_ylabel('Y (NDC)')
ax3.set_title('3. Cambio al MOVER LA CÁMARA\n(Vista 2D desde arriba)', fontsize=12, fontweight='bold')
ax3.set_xlim([-1, 1])
ax3.set_ylim([-1, 1])
ax3.grid(True, alpha=0.3)
ax3.legend()
ax3.axhline(0, color='gray', linestyle='--', linewidth=0.5)
ax3.axvline(0, color='gray', linestyle='--', linewidth=0.5)
ax3.set_aspect('equal')

# ============================================================================
# FIGURA 4: EFECTO DEL NEAR PLANE
# ============================================================================

# Crear cubos a diferentes distancias
cube_far = create_cube(center=(0, 0, -10), size=2.0)
cube_mid = create_cube(center=(0, 0, -5), size=2.0)
cube_near = create_cube(center=(0, 0, -2), size=2.0)
cube_too_near = create_cube(center=(0, 0, -0.3), size=0.5)  # Más cerca que near plane

# Transformar todos los cubos
_, ndc_far = transform_points(V1, P, cube_far)
_, ndc_mid = transform_points(V1, P, cube_mid)
_, ndc_near = transform_points(V1, P, cube_near)
_, ndc_too_near = transform_points(V1, P, cube_too_near)

ax4 = fig.add_subplot(2, 2, 4)
draw_cube_2d(ax4, ndc_far, edges, color='purple', label='z=-10 (lejos)')
draw_cube_2d(ax4, ndc_mid, edges, color='blue', label='z=-5 (medio)')
draw_cube_2d(ax4, ndc_near, edges, color='orange', label='z=-2 (cerca)')
draw_cube_2d(ax4, ndc_too_near, edges, color='red', label='z=-0.3 (recortado por near)')
ax4.set_xlabel('X (NDC)')
ax4.set_ylabel('Y (NDC)')
ax4.set_title('4. Efecto del NEAR PLANE (near=0.5)\n(Objetos muy cercanos se recortan)', fontsize=12, fontweight='bold')
ax4.set_xlim([-2, 2])
ax4.set_ylim([-2, 2])
ax4.grid(True, alpha=0.3)
ax4.legend(loc='upper right', fontsize=9)
ax4.axhline(0, color='gray', linestyle='--', linewidth=0.5)
ax4.axvline(0, color='gray', linestyle='--', linewidth=0.5)
ax4.set_aspect('equal')

# Añadir texto explicativo
fig.text(0.5, 0.02, 
         'Near plane = 0.5 | Far plane = 50.0 | FOV = 60°', 
         ha='center', fontsize=10, style='italic')

plt.tight_layout(rect=[0, 0.03, 1, 1])
plt.show()
