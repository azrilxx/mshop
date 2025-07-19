'use client'

import { useState, useEffect } from 'react'
import { ProductRating, Comment, User } from '@/lib/db'

interface ProductReviewListProps {
  productId: string
  initialRatings: ProductRating[]
  initialComments: Comment[]
  currentUser: User | null
}

export default function ProductReviewList({ 
  productId, 
  initialRatings, 
  initialComments,
  currentUser 
}: ProductReviewListProps) {
  const [ratings, setRatings] = useState<ProductRating[]>(initialRatings)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Calculate average rating
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: currentUser.id,
          content: newComment.trim(),
          isReply: false
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments([comment, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!currentUser || !replyText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          userId: currentUser.id,
          parentId,
          content: replyText.trim(),
          isReply: true
        }),
      })

      if (response.ok) {
        const reply = await response.json()
        setComments([...comments, reply])
        setReplyText('')
        setReplyingTo(null)
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getReplies = (parentId: string) => {
    return comments.filter(comment => comment.parentId === parentId)
  }

  const getTopLevelComments = () => {
    return comments.filter(comment => !comment.parentId)
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-lg font-medium text-gray-900">
              {averageRating.toFixed(1)} out of 5
            </span>
            <span className="ml-2 text-sm text-gray-500">
              ({ratings.length} review{ratings.length !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}

      {/* Reviews */}
      {ratings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
          <div className="space-y-4">
            {ratings.map((rating, index) => (
              <div key={`${rating.productId}-${rating.userId}-${index}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {rating.rating} out of 5
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.comment && (
                  <p className="text-gray-700">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
        
        {/* Add Comment Form */}
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="mb-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a comment..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {getTopLevelComments().map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-gray-900">User</span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              
              {/* Reply Button */}
              {currentUser && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reply
                </button>
              )}

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-3 ml-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write a reply..."
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={submitting || !replyText.trim()}
                      className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText('')
                      }}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-6 mt-3 border-l-2 border-gray-200 pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900">User</span>
                    <span className="text-sm text-gray-500">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{reply.content}</p>
                </div>
              ))}
            </div>
          ))}
          
          {getTopLevelComments().length === 0 && (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  )
}