using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GLTFast;
using UnityEngine;

public sealed class KawanakajimaRuntimeBootstrap : MonoBehaviour
{
    private const int ActorCount = 20;
    private const string TakedaColorName = "Takeda-shi";
    private const string UesugiColorName = "Uesugi-shi";

    [Header("Foundry asset paths")]
    public string samuraiGlbStreamingAssetsPath = "Kawanakajima/samurai_character.glb";
    public string battlefieldPackGlbStreamingAssetsPath = "Kawanakajima/samurai_battlefield_pack.glb";

    private readonly List<ActorData> actors = new List<ActorData>();
    private readonly Vector3 cameraDefaultTarget = new Vector3(0f, 1.7f, -2.2f);

    private Camera mainCamera;
    private GameObject foundryBattlefieldPackRoot;
    private AudioSource musicSource;
    private AudioSource sfxSource;
    private AudioClip chargeCue;
    private AudioClip clashAccent;
    private AudioClip formationStep;
    private AudioClip uiConfirm;

    private Material groundMat;
    private Material hillMat;
    private Material treeMat;
    private Material trunkMat;
    private Material stoneMat;
    private Material takedaMat;
    private Material uesugiMat;
    private Material poleMat;

    private Vector3 cameraTarget;
    private float yaw = -0.68f;
    private float pitch = 0.24f;
    private float distance = 14.5f;
    private bool charging;
    private bool musicEnabled;
    private bool assetsReady;
    private bool foundryBattlefieldPackReady;
    private bool showingFoundryBattlefieldPack;
    private string status = "LOADING FOUNDRY SAMURAI";
    private float currentAngle = -1.82f;
    private float currentPitch = 0.36f;
    private float currentDist = 15.2f;

    private bool isDragging;
    private Vector2 prevMouse;

    private readonly List<DustParticle> dustParticles = new List<DustParticle>();
    private float animTime = 0f;

    private sealed class DustParticle
    {
        public Vector3 position;
        public Vector3 velocity;
        public float phase;
    }

    private sealed class ActorData
    {
        public GameObject Root;
        public bool Takeda;
        public int Index;
        public Vector3 BasePosition;
        public Quaternion BaseRotation;
        public Vector3 ChargeTarget;
        public float IdlePhase;
        public int VariantIndex;
        public string FactionName => Takeda ? TakedaColorName : UesugiColorName;
        public string ActorId => (Takeda ? "TKD" : "UES") + "-" + System.String.Format("{0:D2}", Index + 1);
        public int FormationRow => Index / 10 + 1;
        public int FormationCol => Index % 10 + 1;
    }

    private void CreateDustParticles()
    {
        const int count = 120;
        for (int i = 0; i < count; i++)
        {
            var particle = new DustParticle
            {
                position = new Vector3(
                    UnityEngine.Random.Range(-30f, 30f),
                    UnityEngine.Random.Range(0f, 3f),
                    UnityEngine.Random.Range(-45f, -5f)
                ),
                velocity = new Vector3(
                    UnityEngine.Random.Range(0.1f, 0.3f) * (UnityEngine.Random.value > 0.5f ? 1f : -0.3f),
                    0f,
                    UnityEngine.Random.Range(0.04f, 0.12f)
                ),
                phase = UnityEngine.Random.Range(0f, Mathf.PI * 2f)
            };
            dustParticles.Add(particle);
        }
    }

    private async void Start()
    {
        CreateMaterials();
        CreateCameraAndAudio();
        CreateDustParticles();
        BuildCountryside();
        await LoadSamuraiFormation();
        await LoadFoundryBattlefieldPack();
        ApplyCameraPreset("overview");
        assetsReady = actors.Count == ActorCount;
        status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : "UNITY HANDOFF LOAD FAILED";
        Debug.Log(status + " actors=" + actors.Count + " pack=" + foundryBattlefieldPackReady + " audio=" + (musicSource != null));
    }

    private void Update()
    {
        HandleInput();
        AnimateActors(Time.deltaTime);
        AnimateDust(Time.deltaTime);
        UpdateCamera();
    }

    private void OnGUI()
    {
        const int pad = 14;
        GUI.Box(new Rect(pad, pad, 500, 130), string.Empty);
        GUI.Label(new Rect(pad + 12, pad + 8, 400, 24), "KAWANAKAJIMA — 1561 · UNITY HANDOFF");
        GUI.Label(new Rect(pad + 12, pad + 32, 400, 22), "20 samurai: 10 Takeda / 10 Uesugi");
        GUI.Label(new Rect(pad + 12, pad + 56, 400, 22), status);

        int y = pad + 80;
        if (GUI.Button(new Rect(pad, y, 62, 26), "1 Wide")) ApplyCameraPreset("overview");
        if (GUI.Button(new Rect(pad + 68, y, 52, 26), "2 Red")) ApplyCameraPreset("red");
        if (GUI.Button(new Rect(pad + 126, y, 52, 26), "3 Blue")) ApplyCameraPreset("blue");
        if (GUI.Button(new Rect(pad + 184, y, 62, 26), "4 Side")) ApplyCameraPreset("side");
        if (GUI.Button(new Rect(pad + 252, y, 58, 26), "5 Top")) ApplyCameraPreset("top");
        if (GUI.Button(new Rect(pad + 316, y, 76, 26), "6 Inspect")) ApplyCameraPreset("inspect");

        y = pad + 140;
        if (GUI.Button(new Rect(pad, y, 86, 30), "CHARGE")) Charge();
        if (GUI.Button(new Rect(pad + 92, y, 86, 30), "REFORM")) Reform();
        if (GUI.Button(new Rect(pad + 184, y, 86, 30), musicEnabled ? "AUDIO ON" : "AUDIO")) ToggleMusic();
        if (GUI.Button(new Rect(pad + 276, y, 86, 30), "CLASH")) PlaySfx(clashAccent);
        if (GUI.Button(new Rect(pad + 368, y, 106, 30), showingFoundryBattlefieldPack ? "PACK ON" : "PACK")) ToggleFoundryBattlefieldPack();

        // Faction info panel (shown when inspecting)
        if (selectedActor != null)
        {
            Rect panel = new Rect(520, pad, 260, 200);
            GUI.Box(panel, string.Empty);
            int ly = pad + 12;
            GUI.Label(new Rect(panel.x + 10, ly, 240, 20), "FOCUS: " + selectedActor.ActorId);
            ly += 24;
            GUI.Label(new Rect(panel.x + 10, ly, 240, 20), "Faction: " + selectedActor.FactionName);
            ly += 20;
            GUI.Label(new Rect(panel.x + 10, ly, 240, 20), "Formation: Row " + selectedActor.FormationRow + ", Col " + selectedActor.FormationCol);
            ly += 20;
            GUI.Label(new Rect(panel.x + 10, ly, 240, 20), "Pose variant: " + selectedActor.VariantIndex);
            ly += 20;
            var wp = selectedActor.Root.transform.position;
            GUI.Label(new Rect(panel.x + 10, ly, 240, 20), "Position: " + wp.x.ToString("F2") + ", " + wp.z.ToString("F2"));
            ly += 20;
            if (GUI.Button(new Rect(panel.x + 10, ly, 240, 26), "CLOSE INSPECT"))
            {
                selectedActor = null;
                ApplyCameraPreset("overview");
            }
        }
    }

    private ActorData selectedActor;

    private void CreateMaterials()
    {
        groundMat = MakeMaterial("Paper earth", new Color(0.46f, 0.41f, 0.33f));
        hillMat = MakeMaterial("Distant ink hills", new Color(0.27f, 0.33f, 0.31f));
        treeMat = MakeMaterial("Pine ink", new Color(0.12f, 0.26f, 0.20f));
        trunkMat = MakeMaterial("Pine trunk", new Color(0.26f, 0.19f, 0.13f));
        stoneMat = MakeMaterial("Low stone", new Color(0.35f, 0.35f, 0.33f));
        takedaMat = MakeMaterial("Takeda standard", new Color(0.60f, 0.08f, 0.05f));
        uesugiMat = MakeMaterial("Uesugi standard", new Color(0.08f, 0.17f, 0.48f));
        poleMat = MakeMaterial("Dark pole", new Color(0.08f, 0.06f, 0.04f));
    }

    private static Material MakeMaterial(string name, Color color)
    {
        var shader = Shader.Find("Standard");
        var material = new Material(shader) { name = name, color = color };
        material.SetFloat("_Glossiness", 0.08f);
        return material;
    }

    private void CreateCameraAndAudio()
    {
        mainCamera = Camera.main;
        if (mainCamera == null)
        {
            var go = new GameObject("MainCamera");
            mainCamera = go.AddComponent<Camera>();
            go.AddComponent<AudioListener>();
        }
        mainCamera.transform.position = new Vector3(-11.5f, 4.6f, 14.2f);
        mainCamera.transform.LookAt(new Vector3(-2.8f, 1.8f, -1.5f));

        mainCamera.fog = true;
        mainCamera.fogMode = FogMode.Exponential;
        mainCamera.fogDensity = 0.0055f;

        // Lighting: cool near-white key + rim/kicker
        var keyLight = new GameObject("KeyLight");
        var dl = keyLight.AddComponent<Light>();
        dl.type = LightType.Directional;
        dl.color = new Color(0.91f, 0.93f, 0.96f);
        dl.intensity = 2.1f;
        keyLight.transform.position = new Vector3(12, 28, -11);
        keyLight.transform.LookAt(Vector3.zero);

        var rimLight = new GameObject("RimLight");
        var dl2 = rimLight.AddComponent<Light>();
        dl2.type = LightType.Directional;
        dl2.color = new Color(0.63f, 0.70f, 0.78f);
        dl2.intensity = 2.05f;
        rimLight.transform.position = new Vector3(-22, 11, 19);
        rimLight.transform.LookAt(Vector3.zero);

        var fillLow = new GameObject("FillLow");
        var dl3 = fillLow.AddComponent<Light>();
        dl3.type = LightType.Directional;
        dl3.color = new Color(0.54f, 0.48f, 0.39f);
        dl3.intensity = 0.55f;
        fillLow.transform.position = new Vector3(3, 4, 22);
        fillLow.transform.LookAt(Vector3.zero);

        var blueFill = new GameObject("BlueFill");
        var dl4 = blueFill.AddComponent<Light>();
        dl4.type = LightType.Directional;
        dl4.color = new Color(0.67f, 0.72f, 0.78f);
        dl4.intensity = 0.7f;
        blueFill.transform.position = new Vector3(18, 8, -4);
        blueFill.transform.LookAt(Vector3.zero);

        var rearRim = new GameObject("RearRim");
        var dl5 = rearRim.AddComponent<Light>();
        dl5.type = LightType.Directional;
        dl5.color = new Color(0.72f, 0.77f, 0.82f);
        dl5.intensity = 1.35f;
        rearRim.transform.position = new Vector3(8, 9, -29);
        rearRim.transform.LookAt(Vector3.zero);

        var ambientLight = new GameObject("AmbientLight");
        var al = ambientLight.AddComponent<Light>();
        al.type = LightType.Ambient;
        al.color = new Color(0.25f, 0.22f, 0.16f);
        al.intensity = 1.25f;
        ambientLight.transform.rotation = Quaternion.identity;

        // Audio sources
        var musicGo = new GameObject("MusicSource");
        musicSource = musicGo.AddComponent<AudioSource>();
        musicSource.playOnAwake = false;
        musicSource.spatialBlend = 1f;
        musicSource.rolloffMode = AudioRolloffMode.Linear;

        var sfxGo = new GameObject("SfxSource");
        sfxSource = sfxGo.AddComponent<AudioSource>();
        sfxSource.playOnAwake = false;
        sfxSource.spatialBlend = 0f;
    }

    private void BuildCountryside()
    {
        // Rolling terrain with height variation
        var groundGeo = new PlaneGeometry(110, 88, 64, 52);
        for (int i = 0; i < groundGeo.vertexCount; i++)
        {
            Vector3 v = groundGeo.vertices[i];
            float noise = Mathf.Sin(v.x * 0.08f + v.z * 0.06f) * 0.18f +
                          Mathf.Sin(v.x * 0.15f + 1.2f) * Mathf.Cos(v.z * 0.12f) * 0.12f +
                          Mathf.Sin(v.x * 0.04f + v.z * 0.03f) * 0.25f;
            v.y = noise;
            groundGeo.vertices[i] = v;
        }
        groundGeo.RecalculateNormals();
        var ground = new GameObject("Ground");
        var groundMesh = ground.AddComponent<MeshFilter>();
        groundMesh.mesh = groundGeo;
        ground.AddComponent<MeshRenderer>().material = groundMat;
        ground.transform.rotation = Quaternion.Euler(-90, 0, 0);
        ground.transform.position = new Vector3(0, -0.01f, 0);

        // Central path
        var pathGeo = new PlaneGeometry(4.8f, 72, 16, 8);
        for (int i = 0; i < pathGeo.vertexCount; i++)
        {
            Vector3 v = pathGeo.vertices[i];
            v.y += Mathf.Sin(v.z * 0.15f) * 0.08f;
            pathGeo.vertices[i] = v;
        }
        pathGeo.RecalculateNormals();
        var path = new GameObject("Path");
        path.AddComponent<MeshFilter>().mesh = pathGeo;
        path.AddComponent<MeshRenderer>().material = new Material(Shader.Find("Standard")) { color = new Color(0.25f, 0.21f, 0.16f) };
        path.transform.rotation = Quaternion.Euler(-90, 0, 0);
        path.transform.position = new Vector3(0, 0.01f, -3.8f);

        // Distant hill layers
        Color[] hillColors = {
            new Color(0.26f, 0.24f, 0.19f),
            new Color(0.23f, 0.21f, 0.17f),
            new Color(0.20f, 0.18f, 0.14f),
            new Color(0.17f, 0.15f, 0.12f),
            new Color(0.14f, 0.13f, 0.10f),
            new Color(0.12f, 0.10f, 0.08f),
            new Color(0.10f, 0.09f, 0.07f),
            new Color(0.08f, 0.07f, 0.05f)
        };
        for (int k = 0; k < 8; k++)
        {
            var hillGeo = new PlaneGeometry(92 + k * 10, 32, 24, 16);
            for (int i = 0; i < hillGeo.vertexCount; i++)
            {
                Vector3 v = hillGeo.vertices[i];
                v.y += Mathf.Sin(v.x * 0.12f + k) * 0.4f + Mathf.Cos(v.x * 0.08f + k * 0.5f) * 0.25f;
                hillGeo.vertices[i] = v;
            }
            hillGeo.RecalculateNormals();
            var hill = new GameObject("Hill_" + k);
            hill.AddComponent<MeshFilter>().mesh = hillGeo;
            var hillMatCopy = new Material(hillMat) { color = hillColors[k] };
            hill.AddComponent<MeshRenderer>().material = hillMatCopy;
            hill.transform.rotation = Quaternion.Euler(-90, 0, 0);
            hill.transform.position = new Vector3(
                (k % 2 == 1 ? 1.5f : -2.2f) + k * 0.6f,
                0.05f + k * 0.015f,
                -28 - k * 6
            );
        }

        // Pine trees
        (float x, float z, float s, float rot)[] pinePositions = {
            (-19f, -21f, 0.82f, 0.4f),
            (17f, -23f, 0.76f, -0.6f),
            (-24f, 7f, 0.68f, 1.1f),
            (22f, 5f, 0.71f, -0.9f),
            (-9f, -27f, 0.6f, 0.2f),
            (11f, 19f, 0.65f, -1.3f),
            (-27f, -11f, 0.55f, 0.9f),
            (26f, -14f, 0.58f, -1.0f),
            (-15f, -15f, 0.5f, 0.7f),
            (20f, 10f, 0.48f, -0.5f)
        };
        foreach (var (x, z, s, rot) in pinePositions)
        {
            var tree = new GameObject("Pine");
            tree.transform.position = new Vector3(x, 0, z);
            tree.transform.rotation = Quaternion.Euler(0, rot, 0);
            tree.transform.localScale = Vector3.one * s;

            var trunk = new GameObject("Trunk");
            trunk.AddComponent<MeshFilter>().mesh = CreateCylinder(0.09f, 0.13f, 1.7f, 5);
            trunk.AddComponent<MeshRenderer>().material = trunkMat;
            trunk.transform.localPosition = new Vector3(0, 0.85f, 0);
            tree.transform.AddChild(trunk);

            for (int f = 0; f < 3; f++)
            {
                var foliage = new GameObject("Foliage_" + f);
                float scale = 1.35f - f * 0.25f;
                float height = 2.2f - f * 0.6f;
                float yPos = 2.0f + f * 0.9f;
                foliage.AddComponent<MeshFilter>().mesh = CreateCone(scale, height, 6);
                foliage.AddComponent<MeshRenderer>().material = f < 2 ? treeMat : new Material(treeMat) { color = new Color(0.10f, 0.14f, 0.09f) };
                foliage.transform.localPosition = new Vector3(0, yPos, 0);
                tree.transform.AddChild(foliage);
            }
        }

        // Low stones
        for (int i = 0; i < 14; i++)
        {
            var stone = new GameObject("Stone_" + i);
            stone.AddComponent<MeshFilter>().mesh = new OctahedronGeometry(0.2f + Random.value * 0.15f, 1);
            stone.AddComponent<MeshRenderer>().material = stoneMat;
            float angle = (i / 14f) * Mathf.PI * 2f + Random.value * 0.3f;
            float dist = 2 + Random.value * 6;
            stone.transform.position = new Vector3(
                Mathf.Cos(angle) * dist * 0.3f + (Random.value - 0.5f) * 3,
                0.12f + Random.value * 0.08f,
                -3.5f + Mathf.Sin(angle) * dist * 0.4f
            );
            stone.transform.rotation = Quaternion.Euler(Random.value * 0.6f, i * 0.7f, Random.value * 0.4f);
        }

        // War banners (field standards)
        AddWarBanner("Takeda Field Standard", -9.4f, -7.1f, takedaMat, takedaMat);
        AddWarBanner("Uesugi Field Standard", 9.4f, -4.3f, uesugiMat, uesugiMat);
        AddWarBanner("Takeda Line Standard", -7.8f, -2.5f, takedaMat, takedaMat);
        AddWarBanner("Uesugi Line Standard", 7.8f, -2.0f, uesugiMat, uesugiMat);

        // Force first render
        RenderTexture rt = RenderTexture.GetTemporary(Screen.width, Screen.height, 0);
        mainCamera.targetTexture = rt;
        mainCamera.Render();
        RenderTexture.active = rt;
        Texture2D tex = new Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
        tex.ReadPixels(new Rect(0, 0, Screen.width, Screen.height), 0, 0);
        tex.Apply();
        mainCamera.targetTexture = null;
        RenderTexture.active = null;
        rt.Release();
        Debug.Log("Countryside built: terrain, hills, trees, stones, banners");
    }

    private static Mesh CreateCylinder(float topRadius, float bottomRadius, float height, int segments)
    {
        var mesh = new Mesh();
        var vertices = new List<Vector3>();
        var normals = new List<Vector3>();
        var uvs = new List<Vector2>();
        var indices = new List<int>();

        for (int y = 0; y <= 1; y++)
        {
            float r = topRadius + (bottomRadius - topRadius) * y;
            float yPos = height * y - height * 0.5f;
            for (int i = 0; i <= segments; i++)
            {
                float angle = (i / (float)segments) * Mathf.PI * 2f;
                float x = Mathf.Cos(angle) * r;
                float z = Mathf.Sin(angle) * r;
                vertices.Add(new Vector3(x, yPos, z));
                Vector3 normal = new Vector3(Mathf.Cos(angle), 0, Mathf.Sin(angle)).normalized;
                normals.Add(normal);
                uvs.Add(new Vector2((float)i / segments, y));
            }
        }

        for (int i = 0; i < segments; i++)
        {
            int a = i;
            int b = i + 1;
            int c = i + segments + 1;
            int d = i + segments + 2;
            indices.Add(a); indices.Add(c); indices.Add(b);
            indices.Add(b); indices.Add(c); indices.Add(d);
        }

        mesh.vertices = vertices.ToArray();
        mesh.normals = normals.ToArray();
        mesh.uv = uvs.ToArray();
        mesh.indices = indices.ToArray();
        return mesh;
    }

    private static Mesh CreateCone(float radius, float height, int segments)
    {
        var mesh = new Mesh();
        var vertices = new List<Vector3> { new Vector3(0, height * 0.5f, 0) };
        var normals = new List<Vector3>();
        var uvs = new List<Vector2> { new Vector2(0.5f, 1f) };
        var indices = new List<int>();

        for (int i = 0; i <= segments; i++)
        {
            float angle = (i / (float)segments) * Mathf.PI * 2f;
            float x = Mathf.Cos(angle) * radius;
            float z = Mathf.Sin(angle) * radius;
            vertices.Add(new Vector3(x, -height * 0.5f, z));
            Vector3 n = new Vector3(x, height * 0.5f, z).normalized;
            normals.Add(n);
            uvs.Add(new Vector2((float)i / segments, 0f));
        }

        for (int i = 0; i < segments; i++)
        {
            indices.Add(0);
            indices.Add(2 + i + 1);
            indices.Add(2 + i);
        }

        mesh.vertices = vertices.ToArray();
        mesh.normals = normals.ToArray();
        mesh.uv = uvs.ToArray();
        mesh.indices = indices.ToArray();
        return mesh;
    }

    private static Mesh CreateOctahedron(float radius)
    {
        return OctahedronGeometry.Create(radius, 1);
    }

    private void AddWarBanner(string name, float x, float z, Material clothMat, Material monMat)
    {
        var group = new GameObject(name);
        group.transform.position = new Vector3(x, 0, z);
        group.transform.rotation = Quaternion.Euler(0, x < 0 ? -0.18f : 0.18f, 0);

        // Pole
        var pole = new GameObject("pole");
        pole.AddComponent<MeshFilter>().mesh = CreateCylinder(0.055f, 0.07f, 3.2f, 6);
        pole.AddComponent<MeshRenderer>().material = poleMat;
        pole.transform.localPosition = new Vector3(0, 1.6f, 0);
        group.transform.AddChild(pole);

        // Cross bar
        var cross = new GameObject("crossbar");
        cross.AddComponent<MeshFilter>().mesh = CreateCylinder(0.035f, 0.035f, 1.15f, 6);
        cross.AddComponent<MeshRenderer>().material = poleMat;
        cross.transform.localPosition = new Vector3(0.34f, 2.85f, 0);
        cross.transform.rotation = Quaternion.Euler(0, 0, 90);
        group.transform.AddChild(cross);

        // Cloth banner
        var cloth = new GameObject("cloth");
        cloth.AddComponent<MeshFilter>().mesh = new Mesh { vertices = new[]
        {
            new Vector3(-0.46f, 0.625f, 0f), new Vector3(0.46f, 0.625f, 0f),
            new Vector3(0.46f, -0.625f, 0f), new Vector3(-0.46f, -0.625f, 0f)
        },
        normals = new[] { new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(0, 0, 1) },
        uv = new[] { new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(0, 0) },
        indices = new[] { 0, 1, 2, 0, 2, 3 }
        };
        cloth.AddComponent<MeshRenderer>().material = clothMat;
        cloth.transform.localPosition = new Vector3(0.52f, 2.16f, 0);
        group.transform.AddChild(cloth);

        // Mon (crest circle)
        var mon = new GameObject("mon");
        mon.AddComponent<MeshFilter>().mesh = new CylinderGeometry(0.18f, 0.18f, 0.04f, 32);
        mon.AddComponent<MeshRenderer>().material = monMat;
        mon.transform.localPosition = new Vector3(0.52f, 2.24f, -0.035f);
        mon.transform.rotation = Quaternion.Euler(90, 0, 0);
        group.transform.AddChild(mon);
    }

    private async Task LoadSamuraiFormation()
    {
        string glbPath = Path.Combine(Application.streamingAssetsPath, samuraiGlbStreamingAssetsPath);
        var import = new GltfImport();
        import.Loaded += (gltf) =>
        {
            var baseScene = gltf.RootObject;
            for (int i = 0; i < ActorCount; i++)
            {
                bool isTakeda = i < 10;
                var clone = GameObject.Instantiate(baseScene);
                ApplyVariantPose(clone, i, isTakeda);
                var actor = new ActorData
                {
                    Root = clone,
                    Takeda = isTakeda,
                    Index = i
                };
                actors.Add(actor);
                (isTakeda ? takedaGroup : uesugiGroup).AddChild(clone);
                clone.transform.position = GetActorPosition(actor);
                actor.BasePosition = clone.transform.position;
                actor.BaseRotation = clone.transform.rotation;
                actor.IdlePhase = (i % 10 * 0.9f) + (isTakeda ? 0f : 3.2f);
                actor.VariantIndex = i % 10;
            }
            Debug.Log("Samurai loaded: " + actors.Count + " actors");
            OnAllLoaded();
        };
        import.Failed += (err) => Debug.LogError("Samurai GLB load failed: " + err);
        await import.AsyncOperation.WaitForCompletion();
    }

    private Vector3 GetActorPosition(ActorData actor)
    {
        float spacing = 1.22f;
        float startZ = -5.8f;
        int col = actor.Index % 10;
        int row = actor.Index / 10;
        float x = (actor.Takeda ? -7.4f : 7.4f) + (col - 4.5f) * spacing * 0.86f;
        float z = startZ + row * 2.65f + (col % 3 - 1) * 0.18f;
        return new Vector3(x, 0, z);
    }

    private void ApplyVariantPose(GameObject root, int variantIndex, bool isTakeda)
    {
        var parts = new Dictionary<string, GameObject>();
        root.transform.GetComponentsInChildren(true, (c) => {
            if (c.gameObject && c.gameObject.name != null)
                parts[c.gameObject.name] = c.gameObject;
            return true;
        });

        // Note: In practice, getting children by name requires recursive search
        // Simplified: just set root transform variants
        float v = variantIndex % 10;
        float lean = isTakeda ? 1f : -1f;
        float sc = 0.96f + (v % 3) * 0.018f;
        root.transform.localScale = new Vector3(sc, sc, sc);
        root.transform.localRotation = Quaternion.Euler(
            (v % 3 == 0 ? 0.035f : 0f) * lean,
            (isTakeda ? 0.08f : -0.09f) + (v - 4.5f) * 0.012f * lean,
            0
        );
    }

    private GameObject takedaGroup;
    private GameObject uesugiGroup;

    private async Task LoadFoundryBattlefieldPack()
    {
        try
        {
            string packPath = Path.Combine(Application.streamingAssetsPath, battlefieldPackGlbStreamingAssetsPath);
            var import = new GltfImport();
            import.Loaded += (gltf) =>
            {
                foundryBattlefieldPackRoot = gltf.RootObject;
                foundryBattlefieldPackRoot.SetActive(false);
                foundryBattlefieldPackReady = true;
                Debug.Log("Foundry battlefield pack loaded");
            };
            import.Failed += (err) => Debug.LogError("Battlefield pack load failed: " + err);
            await import.AsyncOperation.WaitForCompletion();
        }
        catch (Exception e)
        {
            Debug.LogWarning("Could not load battlefield pack: " + e.Message);
        }
    }

    private void OnAllLoaded()
    {
        status = "KAWANAKAJIMA_UNITY_READY";
        Debug.Log("Kawanakajima ready: " + actors.Count + " actors");
    }

    private void AnimateActors(float dt)
    {
        for (int i = 0; i < actors.Count; i++)
        {
            var actor = actors[i];
            if (actor.Root == null) continue;

            // Idle breathing
            float baseY = actor.BasePosition.y;
            actor.Root.transform.position = new Vector3(
                actor.Root.transform.position.x,
                baseY + Mathf.Sin(animTime * 1.55f + actor.IdlePhase) * 0.015f,
                actor.Root.transform.position.z
            );

            if (charging)
            {
                // Charge animation
                if (actor.ChargeTarget != Vector3.zero || actor.ChargeTarget != null)
                {
                    actor.Root.transform.position = Vector3.Lerp(
                        actor.Root.transform.position,
                        actor.ChargeTarget,
                        Mathf.Clamp01(dt * 2.8f)
                    );
                    actor.Root.transform.rotation = actor.BaseRotation *
                        Quaternion.Euler(actor.Takeda ? 5f : -5f, 0f, actor.Takeda ? 0.02f : -0.02f);
                }
            }
            else
            {
                // Reform animation
                if (actor.ChargeTarget != Vector3.zero || actor.ChargeTarget != null)
                {
                    actor.Root.transform.position = Vector3.Lerp(
                        actor.Root.transform.position,
                        actor.BasePosition,
                        Mathf.Clamp01(dt * 4.2f)
                    );
                    actor.Root.transform.rotation = Quaternion.Slerp(
                        actor.Root.transform.rotation,
                        actor.BaseRotation,
                        Mathf.Clamp01(dt * 4.2f)
                    );
                }
                else
                {
                    // Gentle rotation wobble
                    actor.Root.transform.localRotation = Quaternion.Euler(
                        actor.Root.transform.localRotation.x * 0.88f,
                        actor.Root.transform.localRotation.y,
                        actor.Root.transform.localRotation.z * 0.88f
                    );
                }
            }
        }
    }

    private void AnimateDust(float dt)
    {
        for (int i = 0; i < dustParticles.Count; i++)
        {
            var p = dustParticles[i];
            p.position.x += p.velocity.x * dt;
            p.position.y += Mathf.Sin(animTime * 0.5f + p.phase) * 0.002f;
            p.position.z += p.velocity.z * dt;

            if (p.position.x > 30f) p.position.x = -30f;
            if (p.position.x < -30f) p.position.x = 30f;
            if (p.position.y > 4f) p.position.y = 0f;
            if (p.position.y < 0f) p.position.y = 4f;

            dustParticles[i] = p;
        }
    }

    private void HandleInput()
    {
        // Orbit controls
        if (Input.GetMouseButton(0) && !isDragging)
        {
            isDragging = true;
            prevMouse = Input.mousePosition;
        }
        if (Input.GetMouseButtonUp(0))
        {
            isDragging = false;
        }
        if (isDragging && Input.GetMouseButton(0))
        {
            Vector2 delta = Input.mousePosition - prevMouse;
            currentAngle -= delta.x * 0.0036f;
            currentPitch = Mathf.Clamp(0.04f, 1.38f, currentPitch + delta.y * 0.0034f);
            prevMouse = Input.mousePosition;
        }

        // Zoom
        if (Input.mouseScrollDelta.y != 0)
        {
            currentDist = Mathf.Clamp(2.6f, 52f, currentDist + Input.mouseScrollDelta.y * 0.016f);
        }

        // Keyboard controls
        if (Input.GetKeyDown(KeyCode.Alpha1) || Input.GetKeyDown(KeyCode.Keypad1)) ApplyCameraPreset("overview");
        if (Input.GetKeyDown(KeyCode.Alpha2) || Input.GetKeyDown(KeyCode.Keypad2)) ApplyCameraPreset("red");
        if (Input.GetKeyDown(KeyCode.Alpha3) || Input.GetKeyDown(KeyCode.Keypad3)) ApplyCameraPreset("blue");
        if (Input.GetKeyDown(KeyCode.Alpha4) || Input.GetKeyDown(KeyCode.Keypad4)) ApplyCameraPreset("side");
        if (Input.GetKeyDown(KeyCode.Alpha5) || Input.GetKeyDown(KeyCode.Keypad5)) ApplyCameraPreset("top");
        if (Input.GetKeyDown(KeyCode.Alpha6) || Input.GetKeyDown(KeyCode.Keypad6)) { ApplyCameraPreset("inspect"); }
        if (Input.GetKeyDown(KeyCode.C)) Charge();
        if (Input.GetKeyDown(KeyCode.R)) Reform();
        if (Input.GetKeyDown(KeyCode.A)) ToggleMusic();
        if (Input.GetKeyDown(KeyCode.X)) PlaySfx(clashAccent);
        if (Input.GetKeyDown(KeyCode.F) || Input.GetKeyDown(KeyCode.Space)) { Input.ResetInputAxes(); ApplyCameraPreset("overview"); }

        // Click to inspect (raycast)
        if (Input.GetMouseButtonDown(0) && !isDragging)
        {
            Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
            RaycastHit[] hits = Physics.Raycast(ray, 100f);
            foreach (var hit in hits)
            {
                foreach (var actor in actors)
                {
                    if (IsChildOf(hit.collider.gameObject, actor.Root))
                    {
                        selectedActor = actor;
                        ApplyInspectCamera(actor);
                        return;
                    }
                }
            }
        }
    }

    private bool IsChildOf(GameObject child, GameObject parent)
    {
        Transform t = child.transform;
        while (t != null)
        {
            if (t.gameObject == parent) return true;
            t = t.parent;
        }
        return false;
    }

    private void ApplyInspectCamera(ActorData actor)
    {
        Vector3 wp = actor.Root.transform.position;
        bool isTakeda = actor.Takeda;
        cameraTarget = new Vector3(
            wp.x + (isTakeda ? -0.1f : -0.22f),
            wp.y + 1.48f,
            wp.z + 0.18f
        );
        currentDist = 4.35f;
        currentAngle = isTakeda ? -0.72f : -1.56f;
        currentPitch = 0.31f;
        status = "INSPECT";
    }

    private void Charge()
    {
        charging = true;
        status = "CHARGING";
        foreach (var actor in actors)
        {
            float dir = actor.Takeda ? 1f : -1f;
            actor.ChargeTarget = actor.BasePosition + new Vector3(dir * 3.9f, 0f, (UnityEngine.Random.value - 0.5f) * 0.7f);
        }
        PlaySfx(chargeCue);
        Invoke(nameof(PlayClash), 0.72f);
    }

    private void Reform()
    {
        charging = false;
        status = "REFORM";
        foreach (var actor in actors)
        {
            actor.ChargeTarget = Vector3.zero;
        }
        PlaySfx(formationStep);
        Invoke(nameof(SetReadyStatus), 0.28f);
    }

    private void SetReadyStatus()
    {
        status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : status;
    }

    private void PlayClash()
    {
        PlaySfx(clashAccent);
    }

    private void ToggleMusic()
    {
        if (musicSource.clip == null)
        {
            status = "AUDIO CLIP MISSING";
            return;
        }
        musicEnabled = !musicEnabled;
        if (musicEnabled) musicSource.Play();
        else musicSource.Stop();
        PlaySfx(uiConfirm);
    }

    private void PlaySfx(AudioClip clip)
    {
        if (clip != null) sfxSource.PlayOneShot(clip);
    }

    private void ApplyCameraPreset(string preset)
    {
        switch (preset)
        {
            case "red":
                cameraTarget = actors.Count > 3 ? actors[3].Root.transform.position + new Vector3(0f, 1.55f, 0.15f) : new Vector3(-5f, 1.7f, -5f);
                currentAngle = -0.72f; currentPitch = 0.30f; currentDist = 5.3f;
                status = "RED CLOSE";
                selectedActor = null;
                break;
            case "blue":
                cameraTarget = actors.Count > 13 ? actors[13].Root.transform.position + new Vector3(0f, 1.55f, 0.15f) : new Vector3(5f, 1.72f, -2.6f);
                currentAngle = -1.58f; currentPitch = 0.30f; currentDist = 5.0f;
                status = "BLUE CLOSE";
                selectedActor = null;
                break;
            case "side":
                cameraTarget = new Vector3(0f, 1.6f, -2f);
                currentAngle = -3.02f; currentPitch = 0.22f; currentDist = 14.5f;
                status = "SIDE PROFILE";
                selectedActor = null;
                break;
            case "top":
                cameraTarget = new Vector3(0f, 1.4f, -4f);
                currentAngle = -1.55f; currentPitch = 1.20f; currentDist = 18.5f;
                status = "TOP FORMATION";
                selectedActor = null;
                break;
            case "inspect":
                cameraTarget = actors.Count > 8 ? actors[8].Root.transform.position + new Vector3(0f, 1.48f, 0.18f) : new Vector3(-5f, 1.8f, -5f);
                currentAngle = -0.72f; currentPitch = 0.31f; currentDist = 4.35f;
                status = "INSPECT ASSET";
                break;
            default:
                cameraTarget = cameraDefaultTarget;
                currentAngle = -0.68f; currentPitch = 0.24f; currentDist = 14.5f;
                status = assetsReady ? "KAWANAKAJIMA_UNITY_READY" : status;
                selectedActor = null;
                break;
        }
    }

    private void UpdateCamera()
    {
        if (mainCamera == null) return;
        float cp = Mathf.Cos(currentPitch);
        var offset = new Vector3(
            Mathf.Sin(currentAngle) * cp * currentDist,
            Mathf.Sin(currentPitch) * currentDist,
            Mathf.Cos(currentAngle) * cp * currentDist
        );
        mainCamera.transform.position = cameraTarget + offset;
        mainCamera.transform.LookAt(cameraTarget);
    }
}

// Helper extensions
public static class TransformExtensions
{
    public static void AddChild(this Transform parent, GameObject child)
    {
        child.transform.SetParent(parent, false);
    }
}
