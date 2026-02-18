using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json;

namespace CoachingApp.API.ModelBinders
{
    public class JsonModelBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
            {
                throw new ArgumentNullException(nameof(bindingContext));
            }

            var modelName = bindingContext.ModelName;
            var valueProviderResult = bindingContext.ValueProvider.GetValue(modelName);

            if (valueProviderResult == ValueProviderResult.None)
            {
                return Task.CompletedTask;
            }

            bindingContext.ModelState.SetModelValue(modelName, valueProviderResult);

            var value = valueProviderResult.FirstValue;

            if (string.IsNullOrEmpty(value))
            {
                return Task.CompletedTask;
            }

            try
            {
                var result = JsonSerializer.Deserialize(value, bindingContext.ModelType, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                bindingContext.Result = ModelBindingResult.Success(result);
            }
            catch (JsonException)
            {
                bindingContext.ModelState.TryAddModelError(modelName, "Invalid JSON format");
            }

            return Task.CompletedTask;
        }
    }

    public class JsonModelBinderAttribute : Attribute, IBindingSourceMetadata
    {
        public BindingSource BindingSource => BindingSource.Form;
    }
}
