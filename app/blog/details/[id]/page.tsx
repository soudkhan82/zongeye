import { useParams } from "next/navigation";
import { getPostById } from "@/app/actions/blog";
import { BlogPost } from "@/interfaces";

async function BlogPostDetail() {
  const { id } = useParams() as { id: string };
  const response = await getPostById(id!);
  const post: BlogPost = response.data;

  // useEffect(() => {
  //   getPostById(id).then(({ data }) => setPost(data));
  // }, [id]);

  if (!post) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 mt-10 border rounded shadow-sm space-y-4">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-gray-600">{post.description}</p>
      <p>
        <strong>Impact:</strong> {post.impact}
      </p>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full max-h-96 object-contain rounded"
        />
      )}
    </div>
  );
}

export default BlogPostDetail;
