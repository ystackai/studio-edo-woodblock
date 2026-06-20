#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public static class KawanakajimaUnityBuild
{
    private const string ScenePath = "Assets/Kawanakajima/Scenes/Kawanakajima.unity";

    [MenuItem("FactoryX/Kawanakajima/Create Or Refresh Scene")]
    public static void CreateOrRefreshScene()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(ScenePath));

        Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var bootstrap = new GameObject("KawanakajimaRuntimeBootstrap");
        bootstrap.AddComponent<KawanakajimaRuntimeBootstrap>();

        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[]
        {
            new EditorBuildSettingsScene(ScenePath, true)
        };
        Debug.Log("Kawanakajima scene refreshed at " + ScenePath);
    }

    public static void BuildWebGL()
    {
        CreateOrRefreshScene();
        Directory.CreateDirectory("Builds/WebGL");
        var options = new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = "Builds/WebGL",
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        };
        AssertBuildSucceeded(BuildPipeline.BuildPlayer(options));
    }

    public static void BuildLinux()
    {
        CreateOrRefreshScene();
        Directory.CreateDirectory("Builds/Linux");
        var options = new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = "Builds/Linux/KawanakajimaSamurai",
            target = BuildTarget.StandaloneLinux64,
            options = BuildOptions.None
        };
        AssertBuildSucceeded(BuildPipeline.BuildPlayer(options));
    }

    public static void BuildMac()
    {
        CreateOrRefreshScene();
        Directory.CreateDirectory("Builds/Mac");
        var options = new BuildPlayerOptions
        {
            scenes = new[] { ScenePath },
            locationPathName = "Builds/Mac/KawanakajimaSamurai.app",
            target = BuildTarget.StandaloneOSX,
            options = BuildOptions.None
        };
        AssertBuildSucceeded(BuildPipeline.BuildPlayer(options));
    }

    private static void AssertBuildSucceeded(BuildReport report)
    {
        if (report.summary.result != BuildResult.Succeeded)
        {
            throw new System.Exception("Kawanakajima Unity build failed: " + report.summary.result);
        }
        Debug.Log("Kawanakajima Unity build succeeded: " + report.summary.outputPath);
    }
}
#endif
