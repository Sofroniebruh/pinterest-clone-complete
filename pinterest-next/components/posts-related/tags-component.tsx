'use client';

import { Input } from '@/components/ui-components/ui/input';
import { Button } from '@/components/ui-components/ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { API } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { TagAndPost, TagsWithIsCreated } from '@/lib/helpers/helper-types-or-interfaces';

interface Props {
  isFileEmpty: boolean;
  setSelectedTagsByUser: (tags: TagsWithIsCreated[]) => void;
  isNotEnteredTags: boolean;
  tagAndPosts?: TagAndPost[];
}

export const TagsComponent = ({ isFileEmpty, tagAndPosts, setSelectedTagsByUser, isNotEnteredTags }: Props) => {
  const initialTags = useMemo(() => {
    return tagAndPosts?.map(tagAndPost => ({
      tagName: tagAndPost.tag.tagName,
      isCreated: true,
    })) ?? [];
  }, [tagAndPosts]);

  const [tagInputValue, setTagInputValue] = useState('');
  const [isStartedTypingTags, setIsStartedTypingTags] = useState(false);
  const [tags, setTags] = useState<TagsWithIsCreated[] | []>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState<TagsWithIsCreated[]>(initialTags);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedTagsByUser(initialTags);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStartedTypingTags(false);
      }
    };

    if (isStartedTypingTags) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStartedTypingTags]);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setTagInputValue(e.target.value);
    setIsStartedTypingTags(true);
    if (e.target.value.length > 0 && e.target.value.trim().length > 0) {
      const selectedTagsNames = selectedTags.map(tag => tag.tagName);
      const excluding = selectedTagsNames.join(',');

      const res = await API.tags.getTagsByName(e.target.value, excluding);
      if (res) {
        setTags(res.tags);
        setIsTagsLoading(false);
        return;
      }
      toast.error('Something went wrong');
    } else {
      setIsTagsLoading(false);
      setIsStartedTypingTags(false);
    }
  };

  const handleNewTag = (text: string) => {
    if (!text.trim()) return;

    if (selectedTags.length >= 5) {
      setTagInputValue('');
      setIsStartedTypingTags(false);
      toast.error('You can select up to 5 tags only');
      return;
    }

    const isAlreadyPresentByAPI = tags.find((tag: TagsWithIsCreated) => tag.tagName === text);
    const isAlreadyChosenByUser = selectedTags.some((tag: TagsWithIsCreated) => tag.tagName === text);

    if (isAlreadyPresentByAPI && !isAlreadyChosenByUser) {
      setSelectedTagsByUser([...selectedTags, isAlreadyPresentByAPI]);
      setSelectedTags([...selectedTags, isAlreadyPresentByAPI]);
      setTagInputValue('');
      setIsStartedTypingTags(false);
      return;
    }

    if (!isAlreadyPresentByAPI && !isAlreadyChosenByUser) {
      setSelectedTags([
        ...selectedTags,
        {
          tagName: text,
          isCreated: false,
        },
      ]);
      setSelectedTagsByUser([
        ...selectedTags,
        {
          tagName: text,
          isCreated: false,
        },
      ]);
      setTagInputValue('');
      setIsStartedTypingTags(false);
      return;
    }

    return;
  };

  return (
    <>
      <div className={'flex gap-2 flex-wrap'}>
        {selectedTags && selectedTags.length > 0 && (
          selectedTags.map((tag, index) => (
            <div className={'flex gap-1 rounded-md border shadow-sm p-2 py-1 items-center justify-center'}
                 key={index}>{tag.tagName}
              <XIcon onClick={() => {
                const updated = selectedTags.filter((t) => t !== tag);
                setSelectedTags(updated);
                setSelectedTagsByUser(updated);
              }} size={16} className={'cursor-pointer'}></XIcon></div>
          ))
        )}
      </div>
      <p className={'text-sm text-gray-500'}>Tags</p>
      <div className="relative">
        <div>
          <Input
            value={tagInputValue}
            placeholder="Enter your tag name..."
            onChange={onChange}
            disabled={isFileEmpty}
          />
          {isNotEnteredTags && (
            <p className={'text-sm text-red-600'}>Tags are required</p>
          )}
        </div>
        {tags && tags.length == 0 &&
          <Button
            type="button"
            disabled={isFileEmpty}
            onClick={() => handleNewTag(tagInputValue)}
            size="sm"
            variant="ghost"
            className="absolute hover:bg-white top-0.5 right-2 z-10"
          >
            Add <PlusIcon size={16} />
          </Button>
        }
        {isStartedTypingTags && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 z-40 my-2 w-full max-w-[335px] rounded-lg border border-gray-300 bg-white shadow-lg p-4"
          >
            {isTagsLoading ? (
              <p className="text-gray-500 text-sm text-center">Loading...</p>
            ) : (
              <div>
                <h3 className="text-md font-semibold mb-2">Suggested Tags</h3>
                <Separator className="mb-2" />
                <div className="max-h-[150px] overflow-y-auto custom-scroll space-y-2">
                  {tags && tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <div
                        onClick={() => {
                          handleNewTag(tag.tagName);
                        }}
                        key={index}
                        className="px-3 py-1 rounded hover:bg-gray-100 cursor-pointer transition"
                      >
                        <p className="text-sm text-gray-800">{tag.tagName}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center">No matching tags were found. Be the
                      first!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};